import { InjectionToken, isDevMode } from '@angular/core';

export const DEFAULT_KINOX_API_URL = 'https://kinoxapi.onrender.com';
export const DISPLAY_KINOX_API_HOST = 'kinoxapi.onrender.com';

export const API_BASE_URL = new InjectionToken<string>('KINOX_API_BASE_URL', {
  providedIn: 'root',
  factory: () => (isDevMode() ? '/api' : DEFAULT_KINOX_API_URL),
});

export function buildApiUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
