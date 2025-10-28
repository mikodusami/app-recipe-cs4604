"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/lib/api";

const AUTH_STORAGE_KEY = "recipe_app_auth";

interface AuthData {
  user: User;
  timestamp: number;
  isAuthenticated: boolean;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Auth utilities for localStorage management
const authUtils = {
  saveUser: (userData: User): boolean => {
    try {
      const authData: AuthData = {
        user: userData,
        timestamp: Date.now(),
        isAuthenticated: true,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      return true;
    } catch (error) {
      console.error("Failed to save user data:", error);
      return false;
    }
  },

  getUser: (): User | null => {
    try {
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!authData) return null;

      const parsed: AuthData = JSON.parse(authData);

      // Check if data is expired (24 hours)
      const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
      if (isExpired) {
        authUtils.clearUser();
        return null;
      }

      return parsed.user;
    } catch (error) {
      console.error("Failed to get user data:", error);
      return null;
    }
  },

  clearUser: (): boolean => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Failed to clear user data:", error);
      return false;
    }
  },

  updateUser: (userData: Partial<User>): boolean => {
    const currentAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!currentAuth) return false;

    try {
      const parsed: AuthData = JSON.parse(currentAuth);
      parsed.user = { ...parsed.user, ...userData };
      parsed.timestamp = Date.now();
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
      return true;
    } catch (error) {
      console.error("Failed to update user data:", error);
      return false;
    }
  },
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = authUtils.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (userData: User) => {
    setUser(userData);
    authUtils.saveUser(userData);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    authUtils.clearUser();
  };

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    authUtils.updateUser(updatedUser);
  };

  const value: UserContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook to use the UserContext
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
