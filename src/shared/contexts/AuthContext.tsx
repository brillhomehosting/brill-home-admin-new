import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ACCESS_TOKEN_EXPIRY_KEY,
  AUTH_SESSION_EVENT,
  REFRESH_TOKEN_KEY,
  TOKEN_KEY,
  USER_KEY,
  clearStoredAuth,
  getStoredAccessTokenExpiry,
  invalidatePendingRefresh,
  isStoredAccessTokenFresh,
  isTerminalRefreshFailure,
  refreshSession,
  storeAuthSession,
} from '@/shared/services/api';
import { authService } from '@/shared/services/auth.service';
import type { User } from '@/shared/types';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
};

const REFRESH_LEAD_MS = 60_000;
const REFRESH_RETRY_MS = 30_000;
const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
      user: token ? readStoredUser() : null,
      isAuthenticated: !!token,
      isLoading: !!token,
    };
  });

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const clearAuthState = useCallback(() => {
    clearTimeout(refreshTimerRef.current);
    clearStoredAuth();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const scheduleRefresh = useCallback((expiresAt: number | null) => {
    clearTimeout(refreshTimerRef.current);
    if (!expiresAt) return;

    const refresh = async () => {
      try {
        await refreshSession();
      } catch (error) {
        if (!isMountedRef.current) return;
        if (isTerminalRefreshFailure(error)) {
          clearStoredAuth();
          return;
        }

        refreshTimerRef.current = setTimeout(refresh, REFRESH_RETRY_MS);
      }
    };

    const delay = Math.max(expiresAt - Date.now() - REFRESH_LEAD_MS, 0);
    refreshTimerRef.current = setTimeout(refresh, delay);
  }, []);

  const syncSessionFromStorage = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!token || !refreshToken) {
      invalidatePendingRefresh();
      clearTimeout(refreshTimerRef.current);
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    setState({
      user: readStoredUser(),
      isAuthenticated: true,
      isLoading: false,
    });
    scheduleRefresh(getStoredAccessTokenExpiry());
  }, [scheduleRefresh]);

  useEffect(() => {
    const handleAuthSessionEvent = () => syncSessionFromStorage();
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === TOKEN_KEY
        || event.key === REFRESH_TOKEN_KEY
        || event.key === USER_KEY
        || event.key === ACCESS_TOKEN_EXPIRY_KEY
      ) {
        syncSessionFromStorage();
      }
    };

    window.addEventListener(AUTH_SESSION_EVENT, handleAuthSessionEvent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, handleAuthSessionEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, [syncSessionFromStorage]);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem(TOKEN_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const storedUser = readStoredUser();
    let cancelled = false;

    if (!storedAccessToken || !storedRefreshToken) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    if (storedUser?.username && isStoredAccessTokenFresh(REFRESH_LEAD_MS)) {
      syncSessionFromStorage();
      return;
    }

    refreshSession()
      .then((session) => {
        if (cancelled) return;
        setState({
          user: session.account,
          isAuthenticated: true,
          isLoading: false,
        });
        scheduleRefresh(getStoredAccessTokenExpiry());
      })
      .catch((error) => {
        if (cancelled) return;
        if (isTerminalRefreshFailure(error)) {
          clearAuthState();
        } else {
          setState({
            user: readStoredUser(),
            isAuthenticated: false,
            isLoading: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clearAuthState, scheduleRefresh, syncSessionFromStorage]);

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await authService.login({ username, password });
      storeAuthSession(result);
      setState({
        user: result.account,
        isAuthenticated: true,
        isLoading: false,
      });
      scheduleRefresh(getStoredAccessTokenExpiry());
    },
    [scheduleRefresh],
  );

  const logout = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      if (storedRefreshToken) {
        await authService.logout(storedRefreshToken);
      }
    } catch {
      // Local logout still completes if the revoke request cannot be delivered.
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  const logoutAllDevices = useCallback(async () => {
    try {
      await authService.logoutAllDevices();
    } catch {
      // Local logout still completes if the revoke request cannot be delivered.
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, logoutAllDevices }),
    [state, login, logout, logoutAllDevices],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
