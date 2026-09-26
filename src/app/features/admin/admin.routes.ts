import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './pages/layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { BarbersComponent } from './pages/barbers/barbers.component';
import { ShopProfileComponent } from './pages/shop-profile/shop-profile.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { roleGuard } from '../../core/guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [roleGuard],
    data: { expectedRole: 'admin' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'barbers', component: BarbersComponent },
      { path: 'horarios', component: BarbersComponent },
      { path: 'shop-profile', component: ShopProfileComponent },
      { path: 'reports', component: ReportsComponent },
    ]
  }
];
