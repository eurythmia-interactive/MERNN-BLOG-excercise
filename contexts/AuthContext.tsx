"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Define the shape of the user object
interface User {
  id: string;
  name: string;
  email: string;
}

// Define interfaces for login and registration data
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterDetails {
  name: string;
  email: string;
  password: string;
}

// Define the shape of the context values
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (details: RegisterDetails) => Promise<void>;
  logout: () => void;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to check user session on initial load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const { data } = await axios.get('/api/auth/me');
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        // User is not logged in or session expired.
        // You can log the error if you want to debug, but avoid sensitive info.
        console.error("Session check failed:", error); // Use the error for debugging
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []); // Empty dependency array means this runs once on mount

  const login = async (credentials: LoginCredentials) => {
    const { data } = await axios.post('/api/auth/login', credentials);
    setUser(data.user);
    router.push('/');
  };

  const register = async (details: RegisterDetails) => {
    await axios.post('/api/auth/register', details);
    router.push('/login');
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};