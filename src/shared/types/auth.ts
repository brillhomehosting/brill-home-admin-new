// ================================================================
// Auth domain types
// ================================================================

export type User = {
  id: string;
  name: string;
  role: string[] | string;
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
  expiresIn: number;
};

export type SignInResponse = {
  user: User;
  tokens: AuthTokens;
};
