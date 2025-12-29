import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map } from 'rxjs';

// --- Types matching User Schema ---
export interface Barber {
    id: string;
    nombre: string;
    activo: boolean;
}

export interface Service {
    id: string;
    nombre: string;
    precio: number;
    duracion_min: number;
    activo: boolean;
}

export interface Client {
    id: string;
    nombre: string;
    telefono: string;
}

export interface Appointment {
    id?: string;
    cliente_id: string;
    service_id: string;
    barber_id: string;
    fecha: string; // date
    hora: string; // time
    precio: number;
    estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
    services?: Service; // joined
    barbers?: Barber;   // joined
}

export interface BarberSchedule {
    id: string;
    barber_id: string;
    dia_semana: number; // 1=Lunes, 7=Domingo
    hora_inicio: string; // time
    hora_fin: string; // time
}

export interface BlockedTime {
    id: string;
    barber_id: string;
    fecha: string; // date
    hora: string; // time
    motivo?: string;
}

export interface BarberiaConfig {
    id: string;
    nombre: string;
    telefono?: string;
    direccion?: string;
    horario_apertura: string; // time
    horario_cierre: string; // time
    moneda: string;
    logo_url?: string;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {

    constructor(private supabaseService: SupabaseService) { }

    // --- Barbers ---
    getActiveBarbers(): Observable<Barber[]> {
        const promise = this.supabaseService.client
            .from('barbers')
            .select('*')
            .eq('activo', true);

        return from(promise).pipe(map(res => res.data as Barber[] || []));
    }

    // --- Services ---
    getActiveServices(): Observable<Service[]> {
        const promise = this.supabaseService.client
            .from('services')
            .select('*')
            .eq('activo', true);

        return from(promise).pipe(map(res => res.data as Service[] || []));
    }

    // --- Barber Schedules ---
    getBarberSchedule(barberId: string, diaSemana: number): Observable<BarberSchedule | null> {
        const promise = this.supabaseService.client
            .from('barber_schedules')
            .select('*')
            .eq('barber_id', barberId)
            .eq('dia_semana', diaSemana)
            .single();

        return from(promise).pipe(map(res => res.data as BarberSchedule || null));
    }

    // --- Blocked Times ---
    getBlockedTimes(barberId: string, fecha: string): Observable<BlockedTime[]> {
        const promise = this.supabaseService.client
            .from('blocked_times')
            .select('*')
            .eq('barber_id', barberId)
            .eq('fecha', fecha);

        return from(promise).pipe(map(res => res.data as BlockedTime[] || []));
    }

    // --- Barberia Config ---
    getBarberiaConfig(): Observable<BarberiaConfig | null> {
        const promise = this.supabaseService.client
            .from('barberia_config')
            .select('*')
            .limit(1)
            .single();

        return from(promise).pipe(map(res => res.data as BarberiaConfig || null));
    }

    // --- Appointments ---
    getAppointmentsForBarber(barberId: string, date: string): Observable<Appointment[]> {
        const promise = this.supabaseService.client
            .from('appointments')
            .select('*')
            .eq('barber_id', barberId)
            .eq('fecha', date)
            .neq('estado', 'cancelada');

        return from(promise).pipe(map(res => res.data as Appointment[] || []));
    }

    getUserAppointments(clientId: string): Observable<Appointment[]> {
        const promise = this.supabaseService.client
            .from('appointments')
            .select(`
        *,
        services (nombre, precio, duracion_min),
        barbers (nombre)
      `)
            .eq('cliente_id', clientId)
            .order('fecha', { ascending: false })
            .order('hora', { ascending: false });

        return from(promise).pipe(map(res => res.data as Appointment[] || []));
    }

    createAppointment(appointment: Appointment): Observable<any> {
        const promise = this.supabaseService.client
            .from('appointments')
            .insert(appointment);

        return from(promise);
    }

    cancelAppointment(appointmentId: string): Observable<any> {
        const promise = this.supabaseService.client
            .from('appointments')
            .update({ estado: 'cancelada' })
            .eq('id', appointmentId);

        return from(promise);
    }
}
