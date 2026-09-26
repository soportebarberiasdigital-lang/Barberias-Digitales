import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/client/home/home.component';
import { BookingComponent } from './features/client/booking/booking.component';
import { AppointmentsComponent } from './features/client/appointments/appointments.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // --- Rutas Públicas ---
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'loader', component: LoadingSpinnerComponent },

  // --- Rutas de Cliente (Protegidas con roleGuard -> 'cliente') ---
  {
    path: 'cliente/reservar',
    component: BookingComponent,
    canActivate: [roleGuard],
    data: { expectedRole: 'cliente' }
  },
  {
    path: 'cliente/mis-citas',
    component: AppointmentsComponent,
    canActivate: [roleGuard],
    data: { expectedRole: 'cliente' }
  },
  {
    path: 'cliente',
    redirectTo: '/cliente/reservar',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [roleGuard],
    data: { expectedRole: 'cliente' }
  },

  // Aliases / Redirecciones para compatibilidad
  { path: 'booking', redirectTo: '/cliente/reservar', pathMatch: 'full' },
  { path: 'appointments', redirectTo: '/cliente/mis-citas', pathMatch: 'full' },

  // --- Rutas de Administración (Protegidas con roleGuard -> 'admin') ---
  {
    path: 'admin',
    canActivate: [roleGuard],
    data: { expectedRole: 'admin' },
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },

  // --- Fallback / Wildcard ---
  { path: '**', redirectTo: '/login' }
];
