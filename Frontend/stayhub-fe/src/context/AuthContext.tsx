'use client';
// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types/User';


interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null; // Define a proper User interface here
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {

    // This function runs once when the app loads
    const verifyUserSession = async () => {
      try {
        // Make a request to a backend endpoint that verifies the session
        const response = await fetch(`${BACKEND_URL}/user/auth`, {
            method: "GET",
            credentials: "include"
        }); // A "who am I" endpoint
        const result = await response.json();
        setUser(result);
        console.log('User session verified.');
      } catch (error) {
        // If the request fails (e.g., 401 Unauthorized), the user is not logged in
        setUser(null);
        console.log('No active user session found.');
      }
      finally {
        setIsLoading(false);
      }
    };
    verifyUserSession();
  }, []);

  const logout = async () => {
    try {
      // Gọi API logout để server xóa HTTP-only Cookie
      // Giả sử endpoint backend của bạn là /auth/logout (Method POST)
      await fetch(`${BACKEND_URL}/user/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.error("Logout failed on server:", error);
      // Dù API lỗi thì ở client vẫn phải xóa user để thoát ra
    } finally {
      // Xóa thông tin user ở client -> Trigger rerender giao diện về trạng thái chưa đăng nhập
      setUser(null);
      // Nếu bạn dùng localStorage để lưu tạm biến loggedIn (optional), hãy xóa nó ở đây
      // localStorage.removeItem('isLoggedIn');
    }
  };

  const value = {
    isAuthenticated: !!user, // True if user object is not null
    user, isLoading, logout 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily access the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

