import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminSupabaseService } from '../../services/admin-supabase.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { AdminAppointment } from '../../models/appointment.model';
import Swal from 'sweetalert2';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  months = MONTHS.map((name, i) => ({ value: i + 1, label: name }));
  years: number[] = [];

  appointments = signal<AdminAppointment[]>([]);
  loading = signal(false);
  generating = signal(false);
  hasData = signal(false);

  form!: FormGroup;

  // ─── Stats ────────────────────────────────────────────────────────────────
  totalIngresos = computed(() =>
    this.appointments().filter(a => a.estado === 'completada').reduce((s, a) => s + (a.precio || 0), 0)
  );

  totalCitas = computed(() =>
    this.appointments().filter(a => a.estado !== 'cancelada').length
  );

  totalCompletadas = computed(() =>
    this.appointments().filter(a => a.estado === 'completada').length
  );

  barberSummary = computed(() => {
    const map = new Map<string, { nombre: string; citas: number; ingresos: number }>();
    this.appointments().filter(a => a.estado === 'completada').forEach(a => {
      const name = a.barbers?.nombre || 'Sin asignar';
      if (!map.has(name)) map.set(name, { nombre: name, citas: 0, ingresos: 0 });
      const e = map.get(name)!;
      e.citas++;
      e.ingresos += a.precio || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.ingresos - a.ingresos);
  });

  constructor(
    private fb: FormBuilder,
    private adminService: AdminSupabaseService,
    private excelService: ExcelExportService
  ) {}

  ngOnInit(): void {
    const now = new Date();
    const currentYear = now.getFullYear();
    for (let y = currentYear; y >= currentYear - 3; y--) this.years.push(y);

    this.form = this.fb.group({
      month: [now.getMonth() + 1, Validators.required],
      year: [currentYear, Validators.required]
    });

    this.loadPreview();
  }

  loadPreview(): void {
    const { month, year } = this.form.value;
    this.loading.set(true);
    this.hasData.set(false);
    this.adminService.getAppointmentsByMonth(year, month).subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.hasData.set(data.length > 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la información.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      }
    });
  }

  generateExcel(): void {
    if (this.appointments().length === 0) {
      Swal.fire({ icon: 'info', title: 'Sin datos', text: 'No hay citas en el período seleccionado.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      return;
    }
    this.generating.set(true);
    const { month, year } = this.form.value;
    const label = `${MONTHS[month - 1]} ${year}`;
    try {
      this.excelService.generateMonthlyReport(this.appointments(), label);
      Swal.fire({ icon: 'success', title: '¡Reporte generado!', text: `Archivo descargado: Reporte_Barberia_${label.replace(' ', '_')}.xlsx`, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al generar', text: 'Ocurrió un error al crear el Excel.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    }
    this.generating.set(false);
  }

  getMonthLabel(): string {
    const { month, year } = this.form.value;
    return `${MONTHS[month - 1]} ${year}`;
  }
}
