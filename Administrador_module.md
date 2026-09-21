# ESPECIFICACIÓN TÉCNICA: MÓDULO ADMINISTRADOR DE BARBERÍA (ANGULAR + SUPABASE)

## Contexto del Proyecto
Actúas como un Desarrollador Angular Senior y Arquitecto Frontend. Debes construir el módulo de administración (`/admin`) para una plataforma de agendamiento de barbería. El diseño debe continuar la línea estética del login: **Tema oscuro elegante (Dark Mode) con acentos en color Dorado / Gold (#C5A059 / #D4AF37)**.

---

### Stack Tecnológico Obligatorio
- **Frontend Framework:** Angular 17+ (Componentes Standalone exclusivamente).
- **Manejo de Estado Local:** Angular Signals (`signal`, `computed`, `effect`).
- **Formularios:** Angular Reactive Forms.
- **Backend / DB:** `@supabase/supabase-js` v2 (Auth, Postgres, Storage).
- **Generación de Reportes:** Librería `xlsx` (SheetJS) para descargas en Excel.
- **Estilos:** Tailwind CSS con tema oscuro personalizado (`bg-[#0d0d0e]`, tarjetas `#18181b`, acentos dorados `#c5a059`).

---

## Paleta de Colores y Estilo Visual (Basado en el Login)
- **Fondo General:** `#0F0F11` (Dark Zinc/Black)
- **Superficies / Tarjetas:** `#18181B` con bordes finos `#27272A`
- **Color Primario (Botones/Highlights):** Dorado (`#C5A059` / `#D4AF37`) con degradados suaves.
- **Texto:** Blanco principal (`#FFFFFF`) y Gris secundario (`#A1A1AA`).

---

## Arquitectura de Carpetas (`src/app/features/admin/`)

```text
src/app/features/admin/
├── admin.routes.ts
├── guards/
│   └── admin.guard.ts
├── models/
│   ├── barber.model.ts
│   ├── shop.model.ts
│   ├── service.model.ts
│   └── appointment.model.ts
├── services/
│   ├── admin-supabase.service.ts
│   └── excel-export.service.ts
└── pages/
    ├── layout/               # Sidebar + Header con botón "Cerrar Sesión"
    ├── dashboard/            # Resumen del día e ingresos
    ├── barbers/              # CRUD Barberos + Redes Sociales
    ├── shop-profile/         # Configuración Datos de Barbería
    └── reports/              # Exportación de reportes mensuales a Excel