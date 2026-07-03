export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiryDate: Date;
}

export interface SessionPayload {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}
