import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage on app start
    const savedUser = localStorage.getItem('blackletter_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('blackletter_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get stored users
      const storedUsers = localStorage.getItem('blackletter_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Find user
      const foundUser = users.find((u: AuthUser) => 
        u.username === credentials.username && 
        u.password === credentials.password // In real app, this would be hashed
      );
      
      if (foundUser) {
        // Remove password from user object before storing
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('blackletter_user', JSON.stringify(userWithoutPassword));
        return true;
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get stored users
      const storedUsers = localStorage.getItem('blackletter_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Check if username already exists
      const existingUser = users.find((u: AuthUser) => u.username === credentials.username);
      if (existingUser) {
        throw new Error('Username already exists');
      }
      
      // Check if email already exists
      const existingEmail = users.find((u: AuthUser) => u.email === credentials.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }
      
      // Create new user
      const newUser: AuthUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: credentials.username,
        email: credentials.email,
        createdAt: new Date().toISOString(),
        password: credentials.password // In real app, this would be hashed
      };
      
      // Add to users array
      users.push(newUser);
      localStorage.setItem('blackletter_users', JSON.stringify(users));
      
      // Log in the new user
      const { password, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('blackletter_user', JSON.stringify(userWithoutPassword));
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('blackletter_user');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 