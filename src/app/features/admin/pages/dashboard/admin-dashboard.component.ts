import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSupabaseService } from '../../services/admin-supabase.service';
import { AdminAppointment } from '../../models/appointment.model';
import { AdminBarber } from '../../models/barber.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  // ─── State ────────────────────────────────────────────────────────────────
  appointments = signal<AdminAppointment[]>([]);
  barbers = signal<AdminBarber[]>([]);
  loading = signal(true);
  selectedDate = signal(this.getTodayDate());
  selectedBarberId = signal<string>('all');
  updatingId = signal<string | null>(null);

  // ─── Computed ─────────────────────────────────────────────────────────────
  filteredAppointments = computed(() => {
    const barberId = this.selectedBarberId();
    const all = this.appointments();
    return barberId === 'all' ? all : all.filter(a => a.barber_id === barberId);
  });

  kpiIngresos = computed(() =>
    this.filteredAppointments()
      .filter(a => a.estado === 'completada')
      .reduce((s, a) => s + (a.precio || 0), 0)
  );

  kpiServicios = computed(() =>
    this.filteredAppointments().filter(a => a.estado === 'completada').length
  );

  kpiServiceBreakdown = computed(() => {
    const map = new Map<string, number>();
    this.filteredAppointments()
      .filter(a => a.estado === 'completada')
      .forEach(a => {
        const name = a.services?.nombre || 'Otro';
        map.set(name, (map.get(name) || 0) + 1);
      });
    return Array.from(map.entries()).map(([nombre, count]) => ({ nombre, count }));
  });

  kpiPendientes = computed(() =>
    this.filteredAppointments().filter(a => a.estado === 'pendiente').length
  );

  kpiConfirmadas = computed(() =>
    this.filteredAppointments().filter(a => a.estado === 'confirmada').length
  );

  constructor(private adminService: AdminSupabaseService) {}

  ngOnInit(): void {
    this.loadBarbers();
    this.loadAppointments();
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadBarbers(): void {
    this.adminService.getAllBarbers().subscribe({
      next: (barbers) => this.barbers.set(barbers),
      error: (err) => console.error('Error cargando barberos:', err)
    });
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.adminService.getAppointmentsByDate(this.selectedDate()).subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.showError('No se pudieron cargar las citas.');
      }
    });
  }

  onDateChange(event: Event): void {
    this.selectedDate.set((event.target as HTMLInputElement).value);
    this.loadAppointments();
  }

  onBarberFilterChange(barberId: string): void {
    this.selectedBarberId.set(barberId);
  }

  updateStatus(
    appt: AdminAppointment,
    status: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
  ): void {
    if (!appt.id) return;
    this.updatingId.set(appt.id);
    this.adminService.updateAppointmentStatus(appt.id, status).subscribe({
      next: () => {
        this.updatingId.set(null);
        this.loadAppointments();
        Swal.fire({ icon: 'success', title: 'Estado actualizado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      },
      error: () => {
        this.updatingId.set(null);
        this.showError('Error al actualizar el estado.');
      }
    });
  }

  getStatusClass(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'badge-pending',
      confirmada: 'badge-confirmed',
      completada: 'badge-completed',
      cancelada: 'badge-cancelled'
    };
    return map[estado] || '';
  }

  getStatusLabel(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      completada: 'Completada',
      cancelada: 'Cancelada'
    };
    return map[estado] || estado;
  }

  private showError(msg: string): void {
    Swal.fire({ icon: 'error', title: 'Error', text: msg, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
  }

  isToday(): boolean {
    return this.selectedDate() === this.getTodayDate();
  }
}
