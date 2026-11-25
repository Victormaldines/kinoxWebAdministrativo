export interface LoginRequest {
  readonly login: string;
  readonly senha: string;
}

export interface LoginResponse {
  readonly token: string;
  readonly userId: number;
  readonly subject: string;
  readonly role: string;
}

export interface AuthSession {
  readonly token: string;
  readonly userId: number;
  readonly subject: string;
  readonly role: string;
  readonly expiresAt: number | null;
  readonly authenticatedAt: string;
}

export interface ApiErrorInfo {
  readonly status: number;
  readonly title: string;
  readonly detail: string;
  readonly recoverable: boolean;
}
