"use client";

import { useState, useEffect, useCallback, useContext, createContext, type ReactNode } from "react";
import { createOrGetUser, getUser, type User } from "./api";

const USER_ID_KEY = "agentology_user_id";
const USER_NAME_KEY = "agentology_user_name";

/**
 * Generate a simple UUID-like ID
 */
function generateUserId(): string {
  return "user_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

interface UserContextValue {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  register: (displayName: string) => Promise<User>;
  refresh: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

/**
 * Provider that holds shared user state for the entire app.
 * Wrap your app with this in layout.
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user on mount
  useEffect(() => {
    const initUser = async () => {
      try {
        const storedId = localStorage.getItem(USER_ID_KEY);
        const storedName = localStorage.getItem(USER_NAME_KEY);

        if (storedId && storedName) {
          // Try to get existing user from backend
          try {
            const existingUser = await getUser(storedId);
            setUser(existingUser);
          } catch {
            // User doesn't exist in backend, create them
            const newUser = await createOrGetUser(storedId, storedName);
            setUser(newUser);
          }
        }
      } catch (err) {
        console.error("Failed to initialize user:", err);
        setError("Failed to connect to server");
      } finally {
        setIsLoading(false);
      }
    };

    initUser();
  }, []);

  /**
   * Register a new user with a display name
   */
  const register = useCallback(async (displayName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = generateUserId();
      const newUser = await createOrGetUser(userId, displayName);

      // Store in localStorage
      localStorage.setItem(USER_ID_KEY, userId);
      localStorage.setItem(USER_NAME_KEY, displayName);

      setUser(newUser);
      return newUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to register";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh user data from backend
   */
  const refresh = useCallback(async () => {
    if (!user) return;

    try {
      const updated = await getUser(user.id);
      setUser(updated);
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  }, [user]);

  /**
   * Logout (clear localStorage)
   */
  const logout = useCallback(() => {
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    setUser(null);
  }, []);

  const isLoggedIn = !!user;

  return (
    <UserContext.Provider value={{ user, isLoading, error, isLoggedIn, register, refresh, logout }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook for accessing shared user state.
 * Must be used within a UserProvider.
 */
export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
