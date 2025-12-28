import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Appointment } from '../../../core/services/booking.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  todayAppointments: Appointment[] = [];

  constructor(private bookingService: BookingService) { }

  ngOnInit(): void {
    // In a real app we would get all appointments for today across all barbers
    // Since we don't have a 'getAllAppointments' method in logic yet exposed generally without ID,
    // we would need to implement it. For now, creating a placeholder behavior.
  }
}
