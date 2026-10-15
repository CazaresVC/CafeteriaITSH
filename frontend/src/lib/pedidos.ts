import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

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

export interface HistorialEstado {
  estadoAnterior: string | null;
  estadoNuevo: string;
  cambiadoPor: number | null;
  fecha: string;
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
  clienteNombre?: string | null;
  fechaRecoleccion?: string | null;
  historial?: HistorialEstado[];
}

export interface LineaPedidoInput {
  platilloId: number;
  cantidad: number;
}

export interface ItemMostradorInput {
  menu_dia_id: number;
  cantidad: number;
}

export interface CrearMostradorInput {
  cliente_nombre?: string;
  items: ItemMostradorInput[];
}

export interface PedidoFiltros {
  estados?: string[];
  origen?: 'anticipado' | 'mostrador';
  refetchInterval?: number | false;
}

export const ESTADOS_ACTIVOS = ['Pendiente', 'Pagado', 'En preparación', 'Listo'];

export function usePedido(id?: number) {
  return useQuery({
    queryKey: ['pedido', id ?? 'sin-id'],
    queryFn: async () => (await api.get<Pedido>(`/pedidos/${id}`)).data,
    enabled: id !== undefined,
  });
}

export function usePedidos(filtros: PedidoFiltros = {}) {
  const { estados, origen, refetchInterval = false } = filtros;
  return useQuery({
    queryKey: ['pedidos', estados ?? [], origen ?? 'todos'],
    queryFn: async () => {
      const parametros = new URLSearchParams();
      for (const estado of estados ?? []) {
        parametros.append('estado', estado);
      }
      if (origen) {
        parametros.set('origen', origen);
      }
      const cadena = parametros.toString();
      return (await api.get<Pedido[]>(`/pedidos${cadena ? `?${cadena}` : ''}`)).data;
    },
    refetchInterval,
  });
}

export function useMisPedidos() {
  return useQuery({
    queryKey: ['pedidos', 'mios'],
    queryFn: async () => (await api.get<Pedido[]>('/pedidos/mios')).data,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
}

export function useCrearPedido() {
  return useMutation({
    mutationFn: async (lineas: LineaPedidoInput[]) =>
      (await api.post<Pedido>('/pedidos', { lineas })).data,
  });
}

export function usePagarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tokenPago }: { id: number; tokenPago?: string }) =>
      (await api.post<Pedido>(`/pedidos/${id}/pagar`, { metodo: 'en_linea', tokenPago })).data,
    onSuccess: (pedido) => {
      queryClient.setQueryData(['pedido', pedido.id], pedido);
    },
  });
}

export function useCrearMostrador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (datos: CrearMostradorInput) =>
      (await api.post<Pedido>('/pedidos/mostrador', datos)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });
}

export function useCobrarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      (await api.post<Pedido>(`/pedidos/${id}/cobro`, { metodo: 'efectivo' })).data,
    onSuccess: async (pedido) => {
      queryClient.setQueryData(['pedido', pedido.id], pedido);
      await queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });
}

export function useCambiarEstado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, estado }: { id: number; estado: string }) =>
      (await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })).data,
    onSuccess: async (pedido) => {
      queryClient.setQueryData(['pedido', pedido.id], pedido);
      await queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });
}
