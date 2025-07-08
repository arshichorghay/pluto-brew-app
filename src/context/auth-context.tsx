
"use client";

import type { User } from "@/lib/types";
import { mockUsers } from "@/lib/mock-data";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, password?: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("pluto-brew-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password?: string): Promise<User | null> => {
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      sessionStorage.setItem("pluto-brew-user", JSON.stringify(foundUser));
      return foundUser;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("pluto-brew-user");
  };

  const register = async (name: string, email: string, password?: string): Promise<User | null> => {
    if (mockUsers.some(u => u.email === email)) {
        // In a real app, you'd throw an error
        console.error("User already exists");
        return null;
    }
    const newUser: User = {
        id: uuidv4(),
        name,
        email,
        password,
        role: 'customer'
    };
    mockUsers.push(newUser); // Note: This is in-memory, will reset on refresh
    setUser(newUser);
    sessionStorage.setItem("pluto-brew-user", JSON.stringify(newUser));
    return newUser;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
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
