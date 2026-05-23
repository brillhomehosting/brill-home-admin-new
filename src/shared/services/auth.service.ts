import api, { refreshSession } from './api';
import { API } from '@/shared/constants';
import type { ApiResponse, SignInPayload, SignInResponse, AuthTokens } from '@/shared/types';

// ================================================================
// Auth API service
// Matches backend: POST /accounts/login, POST /accounts/refresh-token
// ================================================================

/**
 * Login with username & password.
 * Backend: POST /api/v1/accounts/login
 */
export async function login(payload: SignInPayload): Promise<SignInResponse> {
  const { data } = await api.post<ApiResponse<SignInResponse>>(
    API.AUTH.LOGIN,
    payload,
  );
  return data.data;
}

/**
 * Refresh access token using a refresh token.
 * Backend: POST /api/v1/accounts/refresh-token
 */
export async function refreshToken(
  token: string,
): Promise<AuthTokens> {
  const session = await refreshSession(token);
  return session.tokens;
}

/**
 * Invalidate the current device's refresh token.
 * Backend: POST /api/v1/accounts/logout
 */
export async function logout(refreshToken: string): Promise<void> {
  await api.post(API.AUTH.LOGOUT, { refreshToken });
}

/**
 * Invalidate all refresh tokens for the authenticated account (logout all devices).
 * Backend: POST /api/v1/accounts/logout-all
 */
export async function logoutAllDevices(): Promise<void> {
  await api.post(API.AUTH.LOGOUT_ALL);
}

export const authService = { login, refreshToken, logout, logoutAllDevices };
