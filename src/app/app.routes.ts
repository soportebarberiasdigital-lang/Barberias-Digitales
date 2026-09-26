import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/client/home/home.component';
import { BookingComponent } from './features/client/booking/booking.component';
import { AppointmentsComponent } from './features/client/appointments/appointments.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'loader', component: LoadingSpinnerComponent },

    { path: 'home', component: HomeComponent },
    { path: 'booking', component: BookingComponent },
    { path: 'appointments', component: AppointmentsComponent },

    // Admin module — lazy loaded with layout + guard
    {
        path: 'admin',
        loadChildren: () =>
            import('./features/admin/admin.routes').then(m => m.adminRoutes)
    },
];
