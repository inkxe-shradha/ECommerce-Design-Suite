import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  useGetMe,
  useLogout,
  getGetMeQueryKey,
  getGetCartQueryKey,
  getGetHomepageRecommendationsQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { setLogoutCallback } from '../lib/httpClient';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  userName: string;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  sessionExpired: boolean;
  checkSession: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoggedIn: false,
  userName: 'Guest',
  isLoading: false,
  logout: async () => {},
  refreshUser: async () => {},
  sessionExpired: false,
  checkSession: async () => false,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [sessionExpired, setSessionExpired] = useState(false);
  const logoutInProgressRef = useRef(false);
  const wasLoggedInRef = useRef(false);

  const {
    data: user,
    isLoading,
    refetch,
    error,
  } = useGetMe({
    query: {
      retry: false,
    } as any,
  });

  const logoutMutation = useLogout();

  // Define session expiry handler with useCallback to prevent infinite loops
  const handleSessionExpired = useCallback(async () => {
    // Prevent multiple simultaneous logout attempts
    if (logoutInProgressRef.current) {
      console.log('[UserContext] Logout already in progress, skipping...');
      return;
    }

    logoutInProgressRef.current = true;
    wasLoggedInRef.current = false; // Reset since session expired
    console.log('[UserContext] Handling session expiry');
    setSessionExpired(true);
    try {
      sessionStorage.removeItem('shopnow_ai_chat');
    } catch {}
    queryClient.clear();
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    // Redirect to login with expired flag
    setLocation('/login?expired=true');
  }, [queryClient, setLocation]);

  // Set up global logout callback for HTTP client
  useEffect(() => {
    setLogoutCallback(async () => {
      await handleSessionExpired();
    });
  }, [handleSessionExpired]);

  // Check if user received a 401 error
  useEffect(() => {
    if (error && (error as any)?.status === 401) {
      // Only treat as session expiry if user was previously logged in
      // If wasLoggedInRef is false, this is just an anonymous user getting 401 on /api/auth/me
      if (wasLoggedInRef.current) {
        console.log('[UserContext] Detected 401 error - session expired');
        handleSessionExpired();
      } else {
        console.log(
          '[UserContext] 401 from /api/auth/me - user is anonymous, not redirecting',
        );
      }
    }
  }, [error, handleSessionExpired]);

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (err) {
      console.log(
        '[UserContext] Logout error (may already be logged out):',
        err,
      );
    } finally {
      logoutInProgressRef.current = true; // Set flag for session expiry logout
      wasLoggedInRef.current = false; // Reset since user is now logged out
      try {
        sessionStorage.removeItem('shopnow_ai_chat');
      } catch {}
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      setSessionExpired(false);
      setLocation('/login');
    }
  };

  const checkSession = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (res.status === 401) {
        console.log('[UserContext] Session check returned 401');
        handleSessionExpired();
        return false;
      }

      if (res.ok) {
        setSessionExpired(false);
        return true;
      }

      return false;
    } catch (err) {
      console.error('[UserContext] Session check error:', err);
      return false;
    }
  };

  const refreshUser = async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    queryClient.invalidateQueries({
      queryKey: getGetHomepageRecommendationsQueryKey(),
    });
  };

  // Reset logout flag & invalidate recommendations when user successfully logs in
  useEffect(() => {
    if (user && user.id) {
      logoutInProgressRef.current = false;
      wasLoggedInRef.current = true; // Mark that user was logged in
      setSessionExpired(false);
      queryClient.invalidateQueries({
        queryKey: getGetHomepageRecommendationsQueryKey(),
      });
      console.log('[UserContext] User logged in - recommendations refreshed');
    }
  }, [user?.id, queryClient]);

  const isLoggedIn = !!user && !!user.id;
  const userName = user?.name || 'Guest';

  return (
    <UserContext.Provider
      value={{
        user: user || null,
        isLoggedIn,
        userName,
        isLoading,
        logout,
        refreshUser,
        sessionExpired,
        checkSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
