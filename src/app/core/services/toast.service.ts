import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    private readonly defaultConfig = {
        toast: true,
        position: 'bottom-end' as const,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true,
        didOpen: (toast: HTMLElement) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    };

    success(message: string, title: string = '¡Éxito!') {
        Swal.fire({
            ...this.defaultConfig,
            icon: 'success',
            title,
            text: message
        });
    }

    error(message: string, title: string = 'Error') {
        Swal.fire({
            ...this.defaultConfig,
            icon: 'error',
            title,
            text: message
        });
    }

    info(message: string, title: string = 'Información') {
        Swal.fire({
            ...this.defaultConfig,
            icon: 'info',
            title,
            text: message
        });
    }

    warning(message: string, title: string = 'Advertencia') {
        Swal.fire({
            ...this.defaultConfig,
            icon: 'warning',
            title,
            text: message
        });
    }

    async confirm(message: string, title: string = '¿Estás seguro?'): Promise<boolean> {
        const result = await Swal.fire({
            title,
            text: message,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#D4AF37',
            cancelButtonColor: '#CF6679'
        });
        return result.isConfirmed;
    }
}
