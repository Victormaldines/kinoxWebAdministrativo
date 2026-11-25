import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminAuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: {
      redirect: state.url,
    },
  });
};

export const guestOnlyGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  const redirect = route.queryParamMap.get('redirect');
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return router.parseUrl(redirect);
  }

  return router.createUrlTree(['/']);
};
