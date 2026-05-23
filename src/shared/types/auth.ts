// ================================================================
// Auth domain types
// ================================================================

export type User = {
  id: string;
  username: string;
  role: string;
  gender?: string;
  photoURL?: string;
  email?: string;
  loginRedirectUrl?: string;
};

export type SignInPayload = {
  username: string;
  password: string;
};

export type SignUpPayload = {
  displayName: string;
  email: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expireTime: string;
};

export type SignInResponse = {
  account: User;
  tokens: AuthTokens;
};
