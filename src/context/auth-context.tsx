"use client";

import type { User, NewUser } from "@/lib/types";
import { createContext, useContext, useState, useEffect, type ReactNode, useRef, useCallback } from "react";
import { addUser, findUserByCredentials, getUserById } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, password?: string) => Promise<User | null>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const LOCAL_STORAGE_KEY = "pluto-brew-user";

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
    localStorage.removeItem(LOCAL_STORAGE_KEY);
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

  // Effect to load user from localStorage on initial load
  useEffect(() => {
    try {
        const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
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
  
  // Effect to handle user activity and inactivity timeout
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

  // Effect to sync logout across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_KEY && !event.newValue) {
        // User was logged out or data cleared in another tab
        logout();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [logout]);


  const login = async (email: string, password?: string): Promise<User | null> => {
    const foundUser = await findUserByCredentials(email, password);
    if (foundUser) {
      const { password: _, ...userToStore } = foundUser;
      setUser(userToStore as User);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userToStore));
      return userToStore as User;
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
        const { password: _, ...userToStore } = registeredUser;
        setUser(userToStore as User);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userToStore));
        return userToStore as User;
    } catch (error) {
        console.error("Registration failed:", error);
        return null;
    }
  }

  const refreshUser = useCallback(async () => {
    if (user?.id) {
        const freshUser = await getUserById(user.id);
        if (freshUser) {
            const { password: _, ...userToStore } = freshUser;
            setUser(userToStore as User);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userToStore));
        } else {
            logout();
        }
    }
  }, [user, logout]);


  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, refreshUser }}>
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
