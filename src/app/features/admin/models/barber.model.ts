export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string;
}

export interface AdminBarber {
  id?: string;
  nombre: string;
  telefono?: string;
  foto_url?: string;
  activo: boolean;
  redes_sociales?: SocialLinks;
  created_at?: string;
}
