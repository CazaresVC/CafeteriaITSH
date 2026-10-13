import type { RolNombre } from './utils/roles';

export interface UsuarioAutenticado {
  id: number;
  nombre: string;
  correo: string;
  rol: RolNombre;
  activo: boolean;
}

export type UsuarioPublico = UsuarioAutenticado;

export interface Platillo {
  id: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  activo: boolean;
}

export interface MenuItem {
  id: number;
  fecha: string;
  platilloId: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  precio: number;
  disponible: boolean;
  especial: boolean;
}

export interface LineaPedido {
  id: number;
  platilloId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PagoPedido {
  id: number;
  metodo: string;
  monto: number;
  referencia: string | null;
}

export interface Pedido {
  id: number;
  numero: string;
  tipo: string;
  estado: string;
  total: number;
  lineas: LineaPedido[];
  pago: PagoPedido | null;
  creadoEn: string;
}
