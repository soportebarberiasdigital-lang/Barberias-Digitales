import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = await auth.ensureUserLoaded();
  if (user && user.role === 'admin') {
    return true;
  }

  if (user && (user.role === 'cliente' || user.role === 'client')) {
    return router.createUrlTree(['/cliente/reservar']);
  }

  return router.createUrlTree(['/login']);
};
