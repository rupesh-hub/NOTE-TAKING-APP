import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

export const authenticationGuard: CanActivateFn = (route, state) => {
  const _authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  const router = inject(Router);

  return _authenticationService.isAuthenticated$
  .pipe(
    map((isAuthenticated: boolean) => {
      const loginUrl = '/auth/login';
      const homeUrl = '/home';

      if (isAuthenticated && state.url.includes('auth')) {
        router.navigateByUrl(homeUrl);
        return false;
      }

      if (!isAuthenticated && isProtectedRoute(state.url)) {
        router.navigateByUrl(loginUrl);
        return false;
      }

      return true;
    })
  );
};

// Helper function to determine if the route is protected
const isProtectedRoute = (url: string): boolean => {
  const protectedRoutes = ['/home'];
  return protectedRoutes.some((route) => url.startsWith(route));
};
