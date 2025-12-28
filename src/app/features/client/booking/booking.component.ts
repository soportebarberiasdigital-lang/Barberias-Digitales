import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingService, Barber, Service, Appointment } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  step: 1 | 2 | 3 = 1;

  barbers: Barber[] = [];
  selectedBarber: Barber | null = null;
  selectedServiceId: string | null = null;

  selectedDate: string = '';
  selectedTime: string = '';

  availableSlots: string[] = [];
  loadingSlots = false;

  userInfo: any = null;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedServiceId = params['serviceId'];
    });

    this.bookingService.getActiveBarbers().subscribe(barbers => {
      this.barbers = barbers;
    });

    this.authService.currentUser$.subscribe(user => {
      this.userInfo = user;
    });
  }

  selectBarber(barber: Barber) {
    this.selectedBarber = barber;
    this.step = 2;
  }

  onDateChange(event: any) {
    this.selectedDate = event.target.value;
    this.loadSlots();
  }

  loadSlots() {
    if (!this.selectedBarber || !this.selectedDate) return;
    this.loadingSlots = true;

    // Simplification: Static slots for now, normally generated based on open hours (e.g. 9-18)
    // Then filter out existing appointments.
    const allSlots = this.generateTimeSlots('09:00', '18:00', 30); // 30 min slots

    this.bookingService.getAppointmentsForBarber(this.selectedBarber.id, this.selectedDate)
      .subscribe(appointments => {
        const bookedTimes = appointments.map(a => a.hora.substring(0, 5));
        // Also check blocked_times table if we had implementing that service method
        this.availableSlots = allSlots.filter(t => !bookedTimes.includes(t));
        this.loadingSlots = false;
      });
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  goToConfirmation() {
    if (this.selectedDate && this.selectedTime) {
      this.step = 3;
    }
  }

  confirmBooking() {
    if (!this.userInfo || !this.selectedServiceId || !this.selectedBarber || !this.selectedDate || !this.selectedTime) return;

    // We assume the price comes from the service, but here we just need to pass it or look it up.
    // Ideally we fetch the service details again or pass them fully.
    // For now assuming a default or fetched in a real scenario.
    const appointment: Appointment = {
      cliente_id: this.userInfo.id,
      service_id: this.selectedServiceId,
      barber_id: this.selectedBarber.id,
      fecha: this.selectedDate,
      hora: this.selectedTime,
      precio: 0, // Should look up service price
      estado: 'pendiente'
    };

    this.bookingService.createAppointment(appointment).subscribe(() => {
      this.router.navigate(['/appointments']);
    });
  }

  private generateTimeSlots(start: string, end: string, interval: number): string[] {
    const slots = [];
    let current = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);

    while (current < endTime) {
      const timeString = current.toTimeString().substring(0, 5);
      slots.push(timeString);
      current.setMinutes(current.getMinutes() + interval);
    }
    return slots;
  }
}
