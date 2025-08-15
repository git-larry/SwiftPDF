'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('swiftpdf-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call with demo users
      const demoUsers = JSON.parse(localStorage.getItem('swiftpdf-demo-users') || '[]');
      const user = demoUsers.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        const userData = { id: user.id, name: user.name, email: user.email };
        setUser(userData);
        localStorage.setItem('swiftpdf-user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const demoUsers = JSON.parse(localStorage.getItem('swiftpdf-demo-users') || '[]');
      
      // Check if user already exists
      if (demoUsers.some((u: any) => u.email === email)) {
        return false;
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In a real app, this would be hashed
      };

      demoUsers.push(newUser);
      localStorage.setItem('swiftpdf-demo-users', JSON.stringify(demoUsers));

      const userData = { id: newUser.id, name: newUser.name, email: newUser.email };
      setUser(userData);
      localStorage.setItem('swiftpdf-user', JSON.stringify(userData));
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('swiftpdf-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}