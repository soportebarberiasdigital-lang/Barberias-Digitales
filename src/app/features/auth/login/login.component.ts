import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  mode: 'client' | 'admin' = 'client';

  // Client Data
  clientPhone: string = '';
  clientName: string = '';
  showNameInput = false;

  // Admin Data
  adminEmail: string = '';
  adminPass: string = '';

  loading = false;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  toggleMode() {
    this.mode = this.mode === 'client' ? 'admin' : 'client';
    this.error = null;
    this.showNameInput = false;
  }

  async onClientSubmit() {
    if (!this.clientPhone) {
      this.error = 'Ingresa tu celular';
      return;
    }
    if (this.showNameInput && !this.clientName) {
      this.error = 'Ingresa tu nombre';
      return;
    }

    this.loading = true;
    this.error = null;

    const { error } = await this.authService.loginAsClient(this.clientPhone, this.clientName);
    this.loading = false;

    if (error === 'USER_NOT_FOUND_NEED_NAME') {
      this.showNameInput = true;
      this.error = 'Parece que eres nuevo, por favor dinos tu nombre.';
    } else if (error) {
      this.error = error || 'Error en el ingreso';
    } else {
      this.router.navigate(['/home']);
    }
  }

  async onAdminSubmit() {
    if (!this.adminEmail || !this.adminPass) return;

    this.loading = true;
    this.error = null;

    const { error } = await this.authService.loginAsAdmin(this.adminEmail, this.adminPass);
    this.loading = false;

    if (error) {
      this.error = error;
    } else {
      this.router.navigate(['/admin/dashboard']);
    }
  }
}
