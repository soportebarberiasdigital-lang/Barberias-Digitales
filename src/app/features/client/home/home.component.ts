import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Service } from '../../../core/services/booking.service';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  services: Service[] = [];
  loading = true;

  constructor(private bookingService: BookingService, private router: Router) { }

  ngOnInit(): void {
    this.bookingService.getActiveServices().subscribe(services => {
      this.services = services;
      this.loading = false;
    });
  }

  bookService(serviceId: string, precio: number) {
    this.router.navigate(['/booking'], { queryParams: { serviceId, precio } });
  }
}
