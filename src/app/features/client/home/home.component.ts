import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService, Service, Appointment } from '../../../core/services/booking.service';
import { AuthService, AppUser } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentUser: AppUser | null = null;
  services: Service[] = [];
  upcomingAppointment: Appointment | null = null;
  pastAppointments: Appointment[] = [];
  loading = true;
  cancelling = false;

  get clientFirstName(): string {
    if (!this.currentUser || !this.currentUser.name) return 'Estimado Cliente';
    return this.currentUser.name.split(' ')[0];
  }

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.role === 'client') {
        this.loadDashboardData(user.id);
      } else {
        this.loadServicesOnly();
      }
    });
  }

  loadDashboardData(userId: string) {
    this.loading = true;

    // Fetch services and user appointments in parallel
    Promise.all([
      this.bookingService.getActiveServices().toPromise(),
      this.bookingService.getUserAppointments(userId).toPromise()
    ]).then(([services, appointments]) => {
      this.services = services || [];

      if (appointments && appointments.length > 0) {
        // Find upcoming appointment (pendiente or confirmada)
        const activeApps = appointments.filter(a => a.estado === 'pendiente' || a.estado === 'confirmada');
        if (activeApps.length > 0) {
          // Sort chronologically ascending
          activeApps.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
          this.upcomingAppointment = activeApps[0];
        } else {
          this.upcomingAppointment = null;
        }

        // History: completed or cancelled or other appointments
        this.pastAppointments = appointments
          .filter(a => a.id !== this.upcomingAppointment?.id)
          .slice(0, 3); // Top 3 most recent in dashboard
      } else {
        this.upcomingAppointment = null;
        this.pastAppointments = [];
      }

      this.loading = false;
    }).catch(err => {
      console.error('Error loading dashboard data:', err);
      this.loading = false;
    });
  }

  loadServicesOnly() {
    this.bookingService.getActiveServices().subscribe({
      next: (services) => {
        this.services = services;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  bookService(serviceId: string, precio: number) {
    this.router.navigate(['/booking'], { queryParams: { serviceId, precio } });
  }

  goToNewBooking() {
    this.router.navigate(['/booking']);
  }

  goToAllAppointments() {
    this.router.navigate(['/appointments']);
  }

  reprogramAppointment(app: Appointment) {
    this.router.navigate(['/booking'], {
      queryParams: {
        serviceId: app.service_id,
        precio: app.precio
      }
    });
  }

  async cancelAppointment(id: string) {
    const confirmed = await this.toastService.confirm(
      '¿Deseas cancelar esta cita? Esta acción liberará tu turno.',
      '¿Cancelar cita?'
    );

    if (confirmed) {
      this.cancelling = true;
      this.bookingService.cancelAppointment(id).subscribe({
        next: () => {
          this.cancelling = false;
          this.toastService.success('Tu cita ha sido cancelada correctamente');
          if (this.currentUser) {
            this.loadDashboardData(this.currentUser.id);
          }
        },
        error: (err) => {
          this.cancelling = false;
          this.toastService.error('No se pudo cancelar la cita');
          console.error(err);
        }
      });
    }
  }

  getServiceIcon(serviceName: string): string {
    const name = (serviceName || '').toLowerCase();
    if (name.includes('barba')) return 'face_retouching_natural';
    if (name.includes('combo') || name.includes('completo')) return 'style';
    if (name.includes('color') || name.includes('tinte')) return 'palette';
    if (name.includes('spa') || name.includes('facial')) return 'spa';
    return 'content_cut';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
  }
}
