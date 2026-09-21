import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { AdminBarber } from '../models/barber.model';
import { ShopProfile } from '../models/shop.model';
import { AdminAppointment } from '../models/appointment.model';
import { Observable, from, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminSupabaseService {

  constructor(private supabase: SupabaseService) {}

  // ─── BARBERS ────────────────────────────────────────────────────────────────

  getAllBarbers(): Observable<AdminBarber[]> {
    return from(
      this.supabase.client
        .from('barbers')
        .select('*')
        .order('nombre', { ascending: true })
    ).pipe(map(res => (res.data as AdminBarber[]) || []));
  }

  createBarber(barber: AdminBarber): Observable<any> {
    return from(
      this.supabase.client.from('barbers').insert(barber).select().single()
    );
  }

  updateBarber(id: string, barber: Partial<AdminBarber>): Observable<any> {
    return from(
      this.supabase.client.from('barbers').update(barber).eq('id', id)
    );
  }

  deleteBarber(id: string): Observable<any> {
    return from(
      this.supabase.client.from('barbers').delete().eq('id', id)
    );
  }

  async uploadBarberPhoto(barberId: string, file: File): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `barbers/${barberId}.${ext}`;
    const { error } = await this.supabase.client.storage
      .from('barber-photos')
      .upload(path, file, { upsert: true });
    if (error) { console.error(error); return null; }
    const { data } = this.supabase.client.storage
      .from('barber-photos')
      .getPublicUrl(path);
    return data.publicUrl;
  }

  // ─── SHOP PROFILE ────────────────────────────────────────────────────────────

  getShopProfile(): Observable<ShopProfile | null> {
    return from(
      this.supabase.client
        .from('barberia_config')
        .select('*')
        .limit(1)
        .single()
    ).pipe(map(res => (res.data as ShopProfile) || null));
  }

  updateShopProfile(id: string, profile: Partial<ShopProfile>): Observable<any> {
    return from(
      this.supabase.client.from('barberia_config').update(profile).eq('id', id)
    );
  }

  async uploadShopLogo(file: File): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `shop/logo.${ext}`;
    const { error } = await this.supabase.client.storage
      .from('shop-assets')
      .upload(path, file, { upsert: true });
    if (error) { console.error(error); return null; }
    const { data } = this.supabase.client.storage
      .from('shop-assets')
      .getPublicUrl(path);
    return data.publicUrl;
  }

  // ─── APPOINTMENTS ────────────────────────────────────────────────────────────

  getAppointmentsByDate(fecha: string, barberId?: string): Observable<AdminAppointment[]> {
    let query = this.supabase.client
      .from('appointments')
      .select('*, services(nombre, precio, duracion_min), barbers(nombre), clientes(nombre, telefono)')
      .eq('fecha', fecha)
      .order('hora', { ascending: true });
    if (barberId) query = query.eq('barber_id', barberId);
    return from(query).pipe(map(res => (res.data as AdminAppointment[]) || []));
  }

  updateAppointmentStatus(
    id: string,
    estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
  ): Observable<any> {
    return from(
      this.supabase.client.from('appointments').update({ estado }).eq('id', id)
    );
  }

  getAppointmentsByMonth(year: number, month: number): Observable<AdminAppointment[]> {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const start = `${year}-${pad(month)}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${pad(month)}-${pad(lastDay)}`;
    return from(
      this.supabase.client
        .from('appointments')
        .select('*, services(nombre, precio, duracion_min), barbers(nombre), clientes(nombre, telefono)')
        .gte('fecha', start)
        .lte('fecha', end)
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })
    ).pipe(map(res => (res.data as AdminAppointment[]) || []));
  }
}
