export const ROLES = ['administrador', 'cajero', 'cocinero', 'usuario'] as const;

export type RolNombre = (typeof ROLES)[number];

export function esRolValido(valor: string): valor is RolNombre {
  return (ROLES as readonly string[]).includes(valor);
}

export const ETIQUETA_ROL: Record<RolNombre, string> = {
  administrador: 'Administrador',
  cajero: 'Cajero',
  cocinero: 'Cocinero',
  usuario: 'Alumno/Docente',
};
