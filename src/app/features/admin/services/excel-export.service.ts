import { Injectable } from '@angular/core';
import { AdminAppointment } from '../models/appointment.model';
import * as XLSX from 'xlsx';

interface BarberSummary {
  nombre: string;
  totalCitas: number;
  totalIngresos: number;
}

@Injectable({ providedIn: 'root' })
export class ExcelExportService {

  generateMonthlyReport(
    appointments: AdminAppointment[],
    monthLabel: string
  ): void {
    const workbook = XLSX.utils.book_new();

    // ─── Hoja 1: Resumen por Barbero ────────────────────────────────────────
    const summaryMap = new Map<string, BarberSummary>();
    const completed = appointments.filter(a => a.estado === 'completada');

    completed.forEach(a => {
      const barberName = a.barbers?.nombre || 'Sin asignar';
      if (!summaryMap.has(barberName)) {
        summaryMap.set(barberName, { nombre: barberName, totalCitas: 0, totalIngresos: 0 });
      }
      const entry = summaryMap.get(barberName)!;
      entry.totalCitas++;
      entry.totalIngresos += a.precio || 0;
    });

    const summaryData: any[][] = [
      ['RESUMEN POR BARBERO', `Mes: ${monthLabel}`],
      [],
      ['Barbero', 'Citas Completadas', 'Ingresos Generados ($)'],
    ];

    let grandTotal = 0;
    summaryMap.forEach(s => {
      summaryData.push([s.nombre, s.totalCitas, s.totalIngresos]);
      grandTotal += s.totalIngresos;
    });
    summaryData.push([]);
    summaryData.push(['TOTAL BARBERÍA', completed.length, grandTotal]);

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    this.styleSheet(ws1, { colWidths: [30, 22, 25] });
    XLSX.utils.book_append_sheet(workbook, ws1, 'Resumen por Barbero');

    // ─── Hoja 2: Citas Detalladas ────────────────────────────────────────────
    const detailData: any[][] = [
      ['CITAS DETALLADAS', `Mes: ${monthLabel}`],
      [],
      ['Fecha', 'Hora', 'Cliente', 'Teléfono', 'Barbero', 'Servicio', 'Estado', 'Monto ($)'],
    ];

    let totalMonto = 0;
    appointments.forEach(a => {
      detailData.push([
        a.fecha,
        a.hora,
        a.clientes?.nombre || 'N/A',
        a.clientes?.telefono || 'N/A',
        a.barbers?.nombre || 'N/A',
        a.services?.nombre || 'N/A',
        a.estado,
        a.precio || 0,
      ]);
      totalMonto += a.precio || 0;
    });

    detailData.push([]);
    detailData.push(['', '', '', '', '', '', 'TOTAL GENERAL', totalMonto]);

    const ws2 = XLSX.utils.aoa_to_sheet(detailData);
    this.styleSheet(ws2, { colWidths: [14, 10, 25, 16, 20, 22, 14, 14] });
    XLSX.utils.book_append_sheet(workbook, ws2, 'Citas Detalladas');

    // ─── Download ────────────────────────────────────────────────────────────
    const fileName = `Reporte_Barberia_${monthLabel.replace(' ', '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  private styleSheet(ws: XLSX.WorkSheet, opts: { colWidths: number[] }) {
    ws['!cols'] = opts.colWidths.map(w => ({ wch: w }));
  }
}
