import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminSupabaseService } from '../../services/admin-supabase.service';
import { AdminBarber } from '../../models/barber.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-barbers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './barbers.component.html',
  styleUrls: ['./barbers.component.scss']
})
export class BarbersComponent implements OnInit {

  barbers = signal<AdminBarber[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  editingBarber = signal<AdminBarber | null>(null);
  photoPreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminSupabaseService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadBarbers();
  }

  buildForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      telefono: [''],
      activo: [true],
      instagram: [''],
      facebook: [''],
      tiktok: [''],
      whatsapp: ['']
    });
  }

  loadBarbers(): void {
    this.loading.set(true);
    this.adminService.getAllBarbers().subscribe({
      next: (data) => {
        this.barbers.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showError('No se pudieron cargar los barberos.');
      }
    });
  }

  openCreateModal(): void {
    this.editingBarber.set(null);
    this.photoPreview.set(null);
    this.selectedFile.set(null);
    this.form.reset({ activo: true });
    this.showModal.set(true);
  }

  openEditModal(barber: AdminBarber): void {
    this.editingBarber.set(barber);
    this.photoPreview.set(barber.foto_url || null);
    this.selectedFile.set(null);
    this.form.patchValue({
      nombre: barber.nombre,
      telefono: barber.telefono || '',
      activo: barber.activo,
      instagram: barber.redes_sociales?.instagram || '',
      facebook: barber.redes_sociales?.facebook || '',
      tiktok: barber.redes_sociales?.tiktok || '',
      whatsapp: barber.redes_sociales?.whatsapp || '',
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.form.reset();
    this.photoPreview.set(null);
    this.selectedFile.set(null);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.photoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async saveBarber(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const v = this.form.value;
    const barberData: Partial<AdminBarber> = {
      nombre: v.nombre.trim(),
      telefono: v.telefono?.trim() || null,
      activo: v.activo,
      redes_sociales: {
        instagram: v.instagram?.trim() || null,
        facebook: v.facebook?.trim() || null,
        tiktok: v.tiktok?.trim() || null,
        whatsapp: v.whatsapp?.trim() || null,
      }
    };

    const editing = this.editingBarber();

    if (editing?.id) {
      // Handle photo upload first if needed
      if (this.selectedFile()) {
        const url = await this.adminService.uploadBarberPhoto(editing.id, this.selectedFile()!);
        if (url) barberData['foto_url'] = url;
      }

      this.adminService.updateBarber(editing.id, barberData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadBarbers();
          this.showSuccess('Barbero actualizado correctamente.');
        },
        error: () => {
          this.saving.set(false);
          this.showError('Error al actualizar el barbero.');
        }
      });
    } else {
      // Create barber first, then upload photo
      this.adminService.createBarber(barberData as AdminBarber).subscribe({
        next: async (res) => {
          const newId = res.data?.id;
          if (newId && this.selectedFile()) {
            const url = await this.adminService.uploadBarberPhoto(newId, this.selectedFile()!);
            if (url) {
              this.adminService.updateBarber(newId, { foto_url: url }).subscribe();
            }
          }
          this.saving.set(false);
          this.closeModal();
          this.loadBarbers();
          this.showSuccess('Barbero creado correctamente.');
        },
        error: () => {
          this.saving.set(false);
          this.showError('Error al crear el barbero.');
        }
      });
    }
  }

  confirmDelete(barber: AdminBarber): void {
    Swal.fire({
      title: `¿Eliminar a ${barber.nombre}?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed && barber.id) {
        this.adminService.deleteBarber(barber.id).subscribe({
          next: () => {
            this.loadBarbers();
            this.showSuccess('Barbero eliminado.');
          },
          error: () => this.showError('Error al eliminar el barbero.')
        });
      }
    });
  }

  openSocialLink(url: string | undefined): void {
    if (url) window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  private showSuccess(msg: string): void {
    Swal.fire({ icon: 'success', title: msg, toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });
  }

  private showError(msg: string): void {
    Swal.fire({ icon: 'error', title: 'Error', text: msg, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
  }
}
