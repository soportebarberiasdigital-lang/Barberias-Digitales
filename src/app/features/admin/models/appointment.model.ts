export interface AppointmentService {
  nombre: string;
  precio: number;
  duracion_min: number;
}

export interface AppointmentBarber {
  nombre: string;
}

export interface AppointmentClient {
  nombre: string;
  telefono: string;
}

export interface AdminAppointment {
  id?: string;
  cliente_id: string;
  service_id: string;
  barber_id: string;
  fecha: string;
  hora: string;
  precio: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  services?: AppointmentService;
  barbers?: AppointmentBarber;
  clientes?: AppointmentClient;
}
