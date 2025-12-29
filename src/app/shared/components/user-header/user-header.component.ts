import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AppUser } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss']
})
export class UserHeaderComponent implements OnInit {
  currentUser: AppUser | null = null;

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  async logout() {
    const confirmed = await this.toastService.confirm(
      'Se cerrará tu sesión actual',
      '¿Cerrar sesión?'
    );

    if (confirmed) {
      this.authService.logout();
      this.toastService.info('Sesión cerrada correctamente');
    }
  }
}
