
"use client";

import type { User } from "@/lib/types";
import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        // User is signed in, now fetch our custom user data from Firestore
        const appUser = await getUserById(firebaseUser.uid);
        if (appUser) {
          setUser(appUser);
        } else {
            // This could happen if the Firestore doc wasn't created properly
            // Or if a user exists in Auth but not in our 'users' collection
            console.warn("Firebase Auth user exists but no corresponding Firestore document found.");
            // We create a user record on the fly to self-heal
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
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string): Promise<FirebaseUser> => {
    if (!password) throw new Error("Password is required to log in.");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // The onAuthStateChanged listener will handle setting the user state.
    return userCredential.user;
  };

  const register = async (name: string, email: string, password: string): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update Firebase Auth profile
    await updateProfile(firebaseUser, { displayName: name });
    
    // Create our user record in Firestore
    const newUser: User = {
        id: firebaseUser.uid,
        name: name,
        email: email,
        role: email.toLowerCase() === 'admin@plutobrew.com' ? 'admin' : 'customer',
    };
    await createUserRecord(newUser);

    // The onAuthStateChanged listener will handle setting the user state.
    return firebaseUser;
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    // The onAuthStateChanged listener will handle setting the user state to null.
  };
  
  const refreshUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const appUser = await getUserById(firebaseUser.uid);
      if (appUser) {
        setUser(appUser);
      }
    }
  }, []);

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
