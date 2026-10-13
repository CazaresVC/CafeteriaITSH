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

export interface LineaPedidoInput {
  platilloId: number;
  cantidad: number;
}

export function usePedido(id?: number) {
  return useQuery({
    queryKey: ['pedido', id ?? 'sin-id'],
    queryFn: async () => (await api.get<Pedido>(`/pedidos/${id}`)).data,
    enabled: id !== undefined,
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
