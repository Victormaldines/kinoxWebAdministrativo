import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL, buildApiUrl } from '../config/api.config';
import { AdminRoleRequiredError } from '../http/http-error.util';
import { AuthSession, LoginRequest, LoginResponse } from '../models/auth.models';

const SESSION_STORAGE_KEY = 'kinox.admin.session.v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private readonly _session = signal<AuthSession | null>(this.restoreSession());

  readonly session = this._session.asReadonly();

  readonly token = computed(() => {
    const current = this._session();
    if (!current || this.isExpired(current)) return null;
    return current.token;
  });

  readonly isAdmin = computed(() => {
    const current = this._session();
    return current !== null && this.hasAdminRole(current.role);
  });

  readonly isAuthenticated = computed(() => {
    const current = this._session();
    return (
      current !== null &&
      current.token.length > 0 &&
      this.hasAdminRole(current.role) &&
      !this.isExpired(current)
    );
  });

  readonly operatorLabel = computed(() => this._session()?.subject ?? '');

  async login(credentials: LoginRequest): Promise<AuthSession> {
    const url = buildApiUrl(this.apiBaseUrl, '/auth/login');
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(url, {
        login: credentials.login.trim(),
        senha: credentials.senha,
      }),
    );

    if (!response?.token) {
      throw new Error('Token JWT ausente na resposta da API.');
    }

    if (!this.hasAdminRole(response.role)) {
      throw new AdminRoleRequiredError(response.role || 'DESCONHECIDO');
    }

    const session: AuthSession = {
      token: response.token,
      userId: response.userId,
      subject: response.subject || credentials.login.trim(),
      role: response.role,
      expiresAt: decodeJwtExpirationMs(response.token),
      authenticatedAt: new Date().toISOString(),
    };

    this._session.set(session);
    this.persistSession(session);
    return session;
  }

  logout(reason: 'manual' | 'expired' = 'manual', returnUrl?: string): void {
    this._session.set(null);
    this.clearPersistedSession();

    const queryParams: Record<string, string> = {};
    if (reason === 'expired') {
      queryParams['motivo'] = 'expirada';
    }
    if (returnUrl && returnUrl !== '/login') {
      queryParams['redirect'] = returnUrl;
    }

    void this.router.navigate(['/login'], { queryParams });
  }

  clearSessionSilently(): void {
    this._session.set(null);
    this.clearPersistedSession();
  }

  private hasAdminRole(role: string | undefined): boolean {
    if (!role) return false;
    const normalized = role.trim().toUpperCase();
    return (
      normalized === 'ADMIN' ||
      normalized === 'ROLE_ADMIN' ||
      normalized === 'ADMINISTRADOR' ||
      normalized === 'ROLE_ADMINISTRADOR'
    );
  }

  private isExpired(session: AuthSession): boolean {
    if (session.expiresAt === null) return false;
    return Date.now() >= session.expiresAt;
  }

  private restoreSession(): AuthSession | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<AuthSession>;
      if (
        typeof parsed.token !== 'string' ||
        typeof parsed.subject !== 'string' ||
        typeof parsed.role !== 'string'
      ) {
        this.clearPersistedSession();
        return null;
      }

      const restored: AuthSession = {
        token: parsed.token,
        userId: typeof parsed.userId === 'number' ? parsed.userId : 0,
        subject: parsed.subject,
        role: parsed.role,
        expiresAt:
          typeof parsed.expiresAt === 'number'
            ? parsed.expiresAt
            : decodeJwtExpirationMs(parsed.token),
        authenticatedAt:
          typeof parsed.authenticatedAt === 'string'
            ? parsed.authenticatedAt
            : new Date().toISOString(),
      };

      if (!this.hasAdminRole(restored.role) || this.isExpired(restored)) {
        this.clearPersistedSession();
        return null;
      }

      return restored;
    } catch {
      this.clearPersistedSession();
      return null;
    }
  }

  private persistSession(session: AuthSession): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Storage unavailable (e.g. private browsing quota)
    }
  }

  private clearPersistedSession(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup errors
    }
  }
}

function decodeJwtExpirationMs(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = atob(padded);
    const payload = JSON.parse(decoded) as { exp?: unknown };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}
