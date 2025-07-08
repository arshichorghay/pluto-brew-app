
"use client";

import type { User } from "@/lib/types";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile,
    type User as FirebaseUser
} from "firebase/auth";
import { createUserRecord, getUserById } from "@/lib/storage";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<FirebaseUser>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const appUser = await getUserById(firebaseUser.uid);
          if (appUser) {
            setUser(appUser);
          } else {
            // This can happen if a user is created in Firebase Auth but the Firestore doc creation fails
            // or is delayed. We can try to recover by creating the record now.
            console.warn("Firebase Auth user exists but no corresponding Firestore document found. Creating one.");
            const newRecord: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'New User',
                email: firebaseUser.email!,
                role: 'customer',
            }
            await createUserRecord(newRecord);
            setUser(newRecord);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        // THIS IS THE CRITICAL FIX:
        // If fetching the user profile fails (e.g., network error), we DO NOT log the user out.
        // We log the error and allow the app to continue with the potentially stale user data.
        // The user's auth state with Firebase is still valid.
        console.error("Auth state change error (profile fetch failed):", error);
      } finally {
        // This is critical: only set loading to false after the first check.
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount

  const login = async (email: string, password?: string): Promise<FirebaseUser> => {
    if (!password) throw new Error("Password is required to log in.");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle the state update.
    return userCredential.user;
  };

  const register = async (name: string, email: string, password: string): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    await updateProfile(firebaseUser, { displayName: name });
    
    const newUser: User = {
        id: firebaseUser.uid,
        name: name,
        email: email,
        role: email.toLowerCase() === 'admin@plutobrew.com' ? 'admin' : 'customer',
    };
    await createUserRecord(newUser);
    // onAuthStateChanged will handle the state update.
    return firebaseUser;
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    // onAuthStateChanged will handle setting the user state to null.
  };
  
  // This function allows components to manually trigger a refresh of the user profile data.
  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
        try {
            const appUser = await getUserById(firebaseUser.uid);
            if (appUser) {
                setUser(appUser);
            }
        } catch (error) {
            console.error("Failed to refresh user profile:", error);
            // We don't log out here either, just fail gracefully.
        }
    }
  };

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
