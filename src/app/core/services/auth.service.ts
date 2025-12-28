import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Session, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

export type UserRole = 'admin' | 'client' | null;

export interface AppUser {
    id: string; // Supabase Auth ID for admin, or Client UUID for client
    name: string;
    role: UserRole;
    phone?: string;
    email?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _currentUser = new BehaviorSubject<AppUser | null>(null);

    constructor(private supabaseService: SupabaseService, private router: Router) {
        this.recoverSession();
    }

    get currentUser$(): Observable<AppUser | null> {
        return this._currentUser.asObservable();
    }

    get currentUser(): AppUser | null {
        return this._currentUser.value;
    }

    // --- CLIENT ACTIONS (Identification) ---

    async loginAsClient(phone: string, name?: string): Promise<{ error?: string }> {
        // 1. Check if client exists
        const { data: existingClients, error: searchError } = await this.supabaseService.client
            .from('clientes')
            .select('*')
            .eq('telefono', phone)
            .limit(1);

        if (searchError) return { error: searchError.message };

        let client = existingClients && existingClients.length > 0 ? existingClients[0] : null;

        // 2. If not exists, create if name is provided. check if name was NOT provided
        if (!client) {
            if (!name) {
                return { error: 'USER_NOT_FOUND_NEED_NAME' }; // Signal to UI to ask for name
            }
            // Create
            const { data: newClient, error: createError } = await this.supabaseService.client
                .from('clientes')
                .insert({ nombre: name, telefono: phone })
                .select()
                .single();

            if (createError) return { error: createError.message };
            client = newClient;
        }

        // 3. Set Session
        const appUser: AppUser = {
            id: client.id,
            name: client.nombre,
            role: 'client',
            phone: client.telefono
        };

        this.saveLocalUser(appUser);
        return {};
    }

    // --- ADMIN ACTIONS (Supabase Auth) ---

    async loginAsAdmin(email: string, pass: string): Promise<{ error?: string }> {
        const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
            email,
            password: pass
        });

        if (error) return { error: error.message };
        if (data.session) {
            // Fetch Profile to confirm role
            const { data: profile } = await this.supabaseService.client
                .from('profiles')
                .select('*')
                .eq('id', data.session.user.id)
                .single();

            if (!profile || profile.rol !== 'admin') {
                await this.supabaseService.client.auth.signOut();
                return { error: 'No tienes permisos de administrador.' };
            }

            const appUser: AppUser = {
                id: data.session.user.id,
                name: profile.nombre || 'Administrador',
                role: 'admin',
                email: data.session.user.email
            };

            this.saveLocalUser(appUser);
        }
        return {};
    }

    logout() {
        this.supabaseService.client.auth.signOut(); // Just in case
        localStorage.removeItem('barber_app_user');
        this._currentUser.next(null);
        this.router.navigate(['/login']);
    }

    // --- Internal Session Handling ---
    private saveLocalUser(user: AppUser) {
        localStorage.setItem('barber_app_user', JSON.stringify(user));
        this._currentUser.next(user);
    }

    private recoverSession() {
        const stored = localStorage.getItem('barber_app_user');
        if (stored) {
            try {
                const user = JSON.parse(stored);
                this._currentUser.next(user);
            } catch {
                localStorage.removeItem('barber_app_user');
            }
        }
    }
}
