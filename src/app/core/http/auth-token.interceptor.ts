import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from '../config/api.config';

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register'];

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBaseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  const isKinoxApiRequest = req.url.startsWith(apiBaseUrl);

  if (!isKinoxApiRequest) {
    return next(req);
  }

  const relativePath = req.url.slice(apiBaseUrl.length);
  if (PUBLIC_AUTH_PATHS.some((path) => relativePath.startsWith(path))) {
    return next(req);
  }

  const token = inject(AuthService).token();
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
