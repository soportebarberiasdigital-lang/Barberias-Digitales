import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminSupabaseService } from '../../services/admin-supabase.service';
import { ShopProfile } from '../../models/shop.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-shop-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shop-profile.component.html',
  styleUrls: ['./shop-profile.component.scss']
})
export class ShopProfileComponent implements OnInit {

  loading = signal(true);
  saving = signal(false);
  shopId = signal<string | null>(null);
  logoPreview = signal<string | null>(null);
  selectedLogoFile = signal<File | null>(null);

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminSupabaseService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadProfile();
  }

  buildForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      telefono: [''],
      direccion: [''],
      horario_apertura: ['08:00', Validators.required],
      horario_cierre: ['20:00', Validators.required],
    });
  }

  loadProfile(): void {
    this.loading.set(true);
    this.adminService.getShopProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.shopId.set((profile as any).id || null);
          this.logoPreview.set(profile.logo_url || null);
          this.form.patchValue({
            nombre: profile.nombre,
            telefono: profile.telefono || '',
            direccion: profile.direccion || '',
            horario_apertura: profile.horario_apertura || '08:00',
            horario_cierre: profile.horario_cierre || '20:00',
          });
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showError('No se pudo cargar el perfil de la barbería.');
      }
    });
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedLogoFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.logoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async saveProfile(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.shopId()) {
      this.showError('No se encontró el registro de la barbería en la base de datos.');
      return;
    }

    this.saving.set(true);
    const v = this.form.value;
    const updates: Partial<ShopProfile> = {
      nombre: v.nombre.trim(),
      telefono: v.telefono?.trim() || null,
      direccion: v.direccion?.trim() || null,
      horario_apertura: v.horario_apertura,
      horario_cierre: v.horario_cierre,
    };

    if (this.selectedLogoFile()) {
      const url = await this.adminService.uploadShopLogo(this.selectedLogoFile()!);
      if (url) updates['logo_url'] = url;
    }

    this.adminService.updateShopProfile(this.shopId()!, updates).subscribe({
      next: () => {
        this.saving.set(false);
        this.selectedLogoFile.set(null);
        Swal.fire({ icon: 'success', title: '¡Perfil actualizado!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });
      },
      error: () => {
        this.saving.set(false);
        this.showError('Error al guardar los cambios.');
      }
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  private showError(msg: string): void {
    Swal.fire({ icon: 'error', title: 'Error', text: msg, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
  }
}
