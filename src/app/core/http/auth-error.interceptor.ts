import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from '../config/api.config';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const apiBaseUrl = inject(API_BASE_URL).replace(/\/+$/, '');

  return next(req).pipe(
    catchError((error: unknown) => {
      const isLoginRequest = req.url.startsWith(`${apiBaseUrl}/auth/login`);

      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isLoginRequest &&
        auth.session() !== null
      ) {
        auth.logout('expired', router.url);
      }

      return throwError(() => error);
    }),
  );
};
