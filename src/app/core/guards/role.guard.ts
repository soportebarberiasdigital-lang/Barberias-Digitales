import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Obtener/Verificar la sesión activa de Supabase de forma asíncrona
  const user = await authService.ensureUserLoaded();

  if (!user) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // 2. Leer los roles esperados de la metadata de la ruta
  const expectedRole = route.data?.['expectedRole'] as string | undefined;
  const expectedRoles = route.data?.['expectedRoles'] as string[] | undefined;

  const allowedRoles = expectedRoles || (expectedRole ? [expectedRole] : []);

  // Si la ruta no especifica rol, cualquier usuario autenticado tiene acceso
  if (allowedRoles.length === 0) {
    return true;
  }

  // Normalizar el rol del usuario ('client' -> 'cliente')
  const userRole = (user.role === 'client' ? 'cliente' : user.role) || 'cliente';

  const hasAccess = allowedRoles.some(role => {
    const normalizedExpected = (role === 'client' ? 'cliente' : role);
    return normalizedExpected === userRole;
  });

  if (hasAccess) {
    return true;
  }

  // 3. Usuario autenticado con rol incorrecto: Redirigir a su panel correspondiente
  if (userRole === 'admin') {
    return router.createUrlTree(['/admin/dashboard']);
  } else {
    return router.createUrlTree(['/cliente/reservar']);
  }
};
