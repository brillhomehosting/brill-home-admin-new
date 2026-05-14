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
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '@/shared/services/api';
import { authService } from '@/shared/services/auth.service';
import type { User } from '@/shared/types';

// ================================================================
// Auth Context
// Provides: user, isAuthenticated, login, logout, isLoading
// Handles proactive token refresh.
// ================================================================

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  /** true while checking stored tokens on first mount */
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  logoutAllDevices: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Helpers ──
function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

// ── Provider ──
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = readStoredUser();
    return {
      user: token ? user : null,
      isAuthenticated: !!token,
      isLoading: !!token, // need to validate if token exists
    };
  });

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Tracks whether this component instance is still mounted.
  // Used to prevent zombie timer reschedules after unmount.
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ── Schedule proactive refresh ──
  const scheduleRefresh = useCallback((expiresInSeconds: number) => {
    clearTimeout(refreshTimerRef.current);

    // Guard: don't schedule if expiresIn is missing or invalid.
    // Without this, Math.max(NaN, 10_000) = 10_000 causes a 10-second
    // infinite loop when the server omits expiresIn.
    if (!expiresInSeconds || !isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
      return;
    }

    // Refresh at 80% of the token lifetime (at least 10s before expiry)
    const delay = Math.max((expiresInSeconds * 0.8) * 1000, 10_000);

    refreshTimerRef.current = setTimeout(async () => {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) return;

      try {
        const tokens = await authService.refreshToken(storedRefreshToken);
        // Guard: if the component unmounted while the async call was in-flight,
        // don't reschedule — this prevents an orphaned timer cycle.
        if (!isMountedRef.current) return;
        localStorage.setItem(TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        scheduleRefresh(tokens.expiresIn);
      } catch {
        // Refresh failed — the 401 interceptor will handle the redirect
      }
    }, delay);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Validate stored session on mount ──
  useEffect(() => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const storedAccessToken = localStorage.getItem(TOKEN_KEY);

    if (!storedAccessToken || !storedRefreshToken) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    // cancelled prevents the async callbacks from running if this effect
    // instance is cleaned up before the promise resolves (e.g. React
    // StrictMode double-invoke). Without this, the first mount's .then()
    // fires after cleanup and creates a zombie scheduleRefresh cycle that
    // runs alongside the live one, causing constant refresh-token calls.
    let cancelled = false;

    authService
      .refreshToken(storedRefreshToken)
      .then((tokens) => {
        if (cancelled) return;
        localStorage.setItem(TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        scheduleRefresh(tokens.expiresIn);
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false,
        }));
      })
      .catch(() => {
        if (cancelled) return;
        // Token invalid — clear everything
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setState({ user: null, isAuthenticated: false, isLoading: false });
      });

    return () => {
      cancelled = true;
      clearTimeout(refreshTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ──
  const login = useCallback(
    async (username: string, password: string) => {
      const result = await authService.login({ username, password });

      localStorage.setItem(TOKEN_KEY, result.tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, result.tokens.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));

      setState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      });

      scheduleRefresh(result.tokens.expiresIn);
    },
    [scheduleRefresh],
  );

  // ── Shared local cleanup ──
  const clearAuthState = useCallback(() => {
    clearTimeout(refreshTimerRef.current);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  // ── Logout (current device) ──
  const logout = useCallback(() => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (storedRefreshToken) {
      authService.logout(storedRefreshToken).catch(() => {});
    }
    clearAuthState();
  }, [clearAuthState]);

  // ── Logout all devices ──
  const logoutAllDevices = useCallback(async () => {
    try {
      await authService.logoutAllDevices();
    } catch {
      // ignore backend errors — clear locally regardless
    }
    clearAuthState();
  }, [clearAuthState]);

  // ── Memoised value ──
  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, logoutAllDevices }),
    [state, login, logout, logoutAllDevices],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
