import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bottom-navbar',
  templateUrl: './bottom-navbar.component.html',
  styleUrls: ['./bottom-navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BottomNavbarComponent implements OnInit {
  isClient = false;
  isAdmin = false;
  currentRoute = '';

  constructor(private authService: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.isAdmin = user.role === 'admin';
        this.isClient = user.role === 'client';
      } else {
        this.isAdmin = false;
        this.isClient = false;
      }
    });
  }

  isActive(route: string): boolean {
    return this.currentRoute.includes(route);
  }
}
