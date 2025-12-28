import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Appointment } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';

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

  constructor(private bookingService: BookingService, private authService: AuthService) { }

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

  cancelAppointment(id: string) {
    if (confirm('¿Estás seguro de cancelar esta cita?')) {
      this.bookingService.cancelAppointment(id).subscribe(() => {
        // Reload
        const user = this.authService.currentUser;
        if (user) {
          this.loadAppointments(user.id);
        }
      });
    }
  }
}
