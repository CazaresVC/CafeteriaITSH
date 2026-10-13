export const ROLES = ['administrador', 'cajero', 'cocinero', 'usuario'] as const;

export type Rol = (typeof ROLES)[number];

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
}

export const RUTA_POR_ROL: Record<Rol, string> = {
  administrador: '/admin',
  cajero: '/caja',
  cocinero: '/cocina',
  usuario: '/menu',
};

export const ETIQUETA_ROL: Record<Rol, string> = {
  administrador: 'Administrador',
  cajero: 'Cajero',
  cocinero: 'Cocinero',
  usuario: 'Alumno/Docente',
};

export const ETIQUETA_MODULO: Record<Rol, string> = {
  administrador: 'Administración',
  cajero: 'Caja',
  cocinero: 'Cocina',
  usuario: 'Menú',
};
