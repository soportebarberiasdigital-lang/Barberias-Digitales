import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Appointment } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = true;

  constructor(private bookingService: BookingService, private authService: AuthService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.role === 'client') {
        this.loadAppointments(user.id);
      }
    });
  }

  loadAppointments(userId: string) {
    this.bookingService.getUserAppointments(userId).subscribe(apps => {
      this.appointments = apps;
      this.loading = false;
    });
  }

  async cancelAppointment(id: string) {
    const confirmed = await this.toastService.confirm('Esta acción no se puede deshacer', '¿Cancelar cita?');
    if (confirmed) {
      this.bookingService.cancelAppointment(id).subscribe({
        next: () => {
          this.toastService.success('Cita cancelada correctamente');
          const user = this.authService.currentUser;
          if (user) {
            this.loadAppointments(user.id);
          }
        },
        error: (err) => {
          this.toastService.error('No se pudo cancelar la cita');
          console.error(err);
        }
      });
    }
  }
}
