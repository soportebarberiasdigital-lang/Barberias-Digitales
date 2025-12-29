import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingService, Barber, Service, Appointment } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  step: 1 | 2 | 3 = 1;

  barbers: Barber[] = [];
  selectedBarber: Barber | null = null;
  selectedServiceId: string | null = null;
  selectedServicePrecio: number = 0;

  selectedDate: string = '';
  selectedTime: string = '';

  availableSlots: string[] = [];
  loadingSlots = false;

  userInfo: any = null;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedServiceId = params['serviceId'];
      this.selectedServicePrecio = params['precio'];
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

    const selectedDateObj = new Date(this.selectedDate + 'T00:00:00');
    const diaSemana = selectedDateObj.getDay() === 0 ? 7 : selectedDateObj.getDay(); // 1=Lunes, 7=Domingo

    // Fetch all required data in parallel
    Promise.all([
      this.bookingService.getBarberSchedule(this.selectedBarber.id, diaSemana).toPromise(),
      this.bookingService.getBlockedTimes(this.selectedBarber.id, this.selectedDate).toPromise(),
      this.bookingService.getAppointmentsForBarber(this.selectedBarber.id, this.selectedDate).toPromise(),
      this.bookingService.getBarberiaConfig().toPromise()
    ]).then(([schedule, blockedTimes, appointments, config]) => {

      // Determine working hours
      let startTime = '09:00';
      let endTime = '18:00';

      if (schedule) {
        startTime = schedule.hora_inicio.substring(0, 5);
        endTime = schedule.hora_fin.substring(0, 5);
      } else if (config) {
        // Fallback to barberia general hours if no specific schedule
        startTime = config.horario_apertura.substring(0, 5);
        endTime = config.horario_cierre.substring(0, 5);
      }

      // Generate all possible slots
      const allSlots = this.generateTimeSlots(startTime, endTime, 30);

      // Filter out booked appointments
      const bookedTimes = (appointments || []).map(a => a.hora.substring(0, 5));

      // Filter out blocked times
      const blockedSlots = (blockedTimes || []).map(bt => bt.hora?.substring(0, 5)).filter(Boolean);

      // Combine exclusions
      const unavailableSlots = [...bookedTimes, ...blockedSlots];

      this.availableSlots = allSlots.filter(slot => !unavailableSlots.includes(slot));
      this.loadingSlots = false;
    }).catch(error => {
      console.error('Error loading slots:', error);
      this.loadingSlots = false;
      this.availableSlots = [];
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

    const appointment: Appointment = {
      cliente_id: this.userInfo.id,
      service_id: this.selectedServiceId,
      barber_id: this.selectedBarber.id,
      fecha: this.selectedDate,
      hora: this.selectedTime,
      precio: this.selectedServicePrecio,
      estado: 'pendiente'
    };

    this.bookingService.createAppointment(appointment).subscribe({
      next: () => {
        this.toastService.success('Tu cita ha sido agendada correctamente', '¡Reserva confirmada!');
        setTimeout(() => this.router.navigate(['/appointments']), 1000);
      },
      error: (err) => {
        this.toastService.error('No se pudo crear la cita. Intenta de nuevo.', 'Error');
        console.error(err);
      }
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
