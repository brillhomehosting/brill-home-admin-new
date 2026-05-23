import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, SignInResponse } from '@/shared/types';

// ── Storage keys ──
export const TOKEN_KEY = 'brill_access_token';
export const REFRESH_TOKEN_KEY = 'brill_refresh_token';
export const USER_KEY = 'brill_user';
export const ACCESS_TOKEN_EXPIRY_KEY = 'brill_access_token_expires_at';
export const AUTH_SESSION_EVENT = 'brill-auth-session-changed';
let authSessionRevision = 0;

/**
 * Main Axios instance — pre-configured with:
 * - Base URL from env
 * - Request interceptor: attaches Bearer token
 * - Response interceptor: 401 → attempt refresh → if fail redirect to /sign-in
 */
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor: attach Bearer token ──
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

function notifyAuthSessionChanged() {
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function clearStoredAuth() {
  authSessionRevision += 1;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ACCESS_TOKEN_EXPIRY_KEY);
  notifyAuthSessionChanged();
}

function readAccessTokenExpiry(accessToken: string): number | null {
  try {
    const payload = accessToken.split('.')[1];
    if (!payload) return null;

    const unpadded = payload.replace(/-/g, '+').replace(/_/g, '/');
    const normalized = unpadded.padEnd(Math.ceil(unpadded.length / 4) * 4, '=');
    const claims = JSON.parse(atob(normalized)) as { exp?: number };
    return typeof claims.exp === 'number' ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function getStoredAccessTokenExpiry(): number | null {
  const stored = localStorage.getItem(ACCESS_TOKEN_EXPIRY_KEY);
  if (stored) {
    const expiry = Number(stored);
    if (Number.isFinite(expiry)) return expiry;
  }

  const accessToken = localStorage.getItem(TOKEN_KEY);
  return accessToken ? readAccessTokenExpiry(accessToken) : null;
}

export function isStoredAccessTokenFresh(minValidityMs = 0): boolean {
  const expiry = getStoredAccessTokenExpiry();
  return expiry !== null && expiry - Date.now() > minValidityMs;
}

export function storeAuthSession(session: SignInResponse) {
  authSessionRevision += 1;
  const { account, tokens } = session;
  const expiry = readAccessTokenExpiry(tokens.accessToken);

  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(account));
  if (expiry !== null) {
    localStorage.setItem(ACCESS_TOKEN_EXPIRY_KEY, String(expiry));
  } else {
    localStorage.removeItem(ACCESS_TOKEN_EXPIRY_KEY);
  }
  notifyAuthSessionChanged();
}

export function invalidatePendingRefresh() {
  authSessionRevision += 1;
}

let refreshPromise: Promise<SignInResponse> | null = null;

export function refreshSession(
  refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY),
): Promise<SignInResponse> {
  if (!refreshToken) {
    return Promise.reject(new Error('No refresh token available'));
  }

  if (!refreshPromise) {
    const revisionAtRequestStart = authSessionRevision;
    refreshPromise = axios
      .post<ApiResponse<SignInResponse>>(
        `${import.meta.env.VITE_API_BASE_URL}/accounts/refresh-token`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      )
      .then(({ data }) => {
        if (
          revisionAtRequestStart !== authSessionRevision
          || localStorage.getItem(REFRESH_TOKEN_KEY) !== refreshToken
        ) {
          throw new Error('Authentication session changed while refreshing');
        }
        storeAuthSession(data.data);
        return data.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export function isTerminalRefreshFailure(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  return [400, 401, 403].includes(error.response?.status ?? 0);
}

function handleAuthFailure() {
  clearStoredAuth();

  if (window.location.pathname !== '/sign-in') {
    sessionStorage.setItem('redirectUrl', window.location.pathname);
    window.location.href = '/sign-in';
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only intercept 401 and avoid infinite retry
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (!localStorage.getItem(REFRESH_TOKEN_KEY)) {
      handleAuthFailure();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const session = await refreshSession();
      originalRequest.headers.Authorization = `Bearer ${session.tokens.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      if (isTerminalRefreshFailure(refreshError)) {
        handleAuthFailure();
      }
      return Promise.reject(refreshError);
    }
  },
);

export { api };
export default api;
