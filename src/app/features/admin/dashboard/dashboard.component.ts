import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Appointment } from '../../../core/services/booking.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';

interface DashboardStats {
  totalCitas: number;
  ingresos: number;
  pendientes: number;
  confirmadas: number;
  completadas: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  todayAppointments: Appointment[] = [];
  stats: DashboardStats = {
    totalCitas: 0,
    ingresos: 0,
    pendientes: 0,
    confirmadas: 0,
    completadas: 0
  };
  loading = true;
  selectedDate: string = '';

  constructor(private bookingService: BookingService) { }

  ngOnInit(): void {
    this.selectedDate = this.getTodayDate();
    this.loadTodayAppointments();
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadTodayAppointments(): void {
    this.loading = true;
    this.bookingService.getAllTodayAppointments().subscribe({
      next: (appointments) => {
        this.todayAppointments = appointments;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las citas',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }

  loadAppointmentsByDate(date: string): void {
    this.loading = true;
    this.bookingService.getAllAppointmentsByDate(date).subscribe({
      next: (appointments) => {
        this.todayAppointments = appointments;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats = {
      totalCitas: this.todayAppointments.filter(a => a.estado !== 'cancelada').length,
      ingresos: this.todayAppointments
        .filter(a => a.estado === 'completada')
        .reduce((sum, a) => sum + a.precio, 0),
      pendientes: this.todayAppointments.filter(a => a.estado === 'pendiente').length,
      confirmadas: this.todayAppointments.filter(a => a.estado === 'confirmada').length,
      completadas: this.todayAppointments.filter(a => a.estado === 'completada').length
    };
  }

  updateAppointmentStatus(appointmentId: string, newStatus: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'): void {
    this.bookingService.updateAppointmentStatus(appointmentId, newStatus).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Estado actualizado',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
        this.loadTodayAppointments();
      },
      error: (error) => {
        console.error('Error al actualizar estado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate = input.value;
    this.loadAppointmentsByDate(this.selectedDate);
  }

  getStatusClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'pendiente': 'status-pending',
      'confirmada': 'status-confirmed',
      'completada': 'status-completed',
      'cancelada': 'status-cancelled'
    };
    return classes[estado] || '';
  }

  getStatusLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };
    return labels[estado] || estado;
  }
}
