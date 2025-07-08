
"use client";

import type { User, NewUser } from "@/lib/types";
import { createContext, useContext, useState, useEffect, type ReactNode, useRef, useCallback } from "react";
import { addUser, findUserByCredentials } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, password?: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    setUser(null);
    localStorage.removeItem("pluto-brew-user");
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
        variant: "destructive",
      });
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [logout, toast]);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    try {
        const storedUser = localStorage.getItem("pluto-brew-user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        setUser(null);
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (user) {
      const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll'];
      
      const handleActivity = () => {
        resetInactivityTimer();
      };

      events.forEach(event => window.addEventListener(event, handleActivity));
      resetInactivityTimer(); // Start the timer initially

      return () => {
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
        events.forEach(event => window.removeEventListener(event, handleActivity));
      };
    }
  }, [user, resetInactivityTimer]);

  const login = async (email: string, password?: string): Promise<User | null> => {
    const foundUser = await findUserByCredentials(email, password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("pluto-brew-user", JSON.stringify(foundUser));
      return foundUser;
    }
    return null;
  };

  const register = async (name: string, email: string, password?: string): Promise<User | null> => {
    const newUser: NewUser = {
        name,
        email,
        password,
        role: 'customer'
    };

    try {
        const registeredUser = await addUser(newUser);
        setUser(registeredUser);
        localStorage.setItem("pluto-brew-user", JSON.stringify(registeredUser));
        return registeredUser;
    } catch (error) {
        console.error("Registration failed:", error);
        return null;
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
