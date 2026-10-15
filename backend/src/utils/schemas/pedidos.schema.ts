import { z } from 'zod';
import { ESTADOS_PEDIDO } from '../../services/estado.service';

export const pedidoInputSchema = z.object({
  lineas: z
    .array(
      z.object({
        platilloId: z.coerce.number().int().positive('Platillo inválido'),
        cantidad: z.coerce
          .number()
          .int()
          .positive('La cantidad debe ser mayor a cero')
          .max(99, 'La cantidad es demasiado alta'),
      }),
    )
    .min(1, 'El pedido debe tener al menos un platillo'),
});

export const pagoInputSchema = z.object({
  metodo: z.literal('en_linea', {
    errorMap: () => ({ message: 'El método de pago debe ser en línea' }),
  }),
  tokenPago: z.string().trim().max(100, 'El token de pago es demasiado largo').optional(),
});

export const crearMostradorSchema = z.object({
  cliente_nombre: z
    .string()
    .trim()
    .max(100, 'El nombre del cliente es demasiado largo')
    .optional(),
  items: z
    .array(
      z.object({
        menu_dia_id: z.coerce.number().int().positive('Platillo inválido'),
        cantidad: z.coerce
          .number()
          .int()
          .positive('La cantidad debe ser mayor a cero')
          .max(99, 'La cantidad es demasiado alta'),
      }),
    )
    .min(1, 'El pedido debe tener al menos un platillo'),
});

export const cobroSchema = z.object({
  metodo: z.literal('efectivo', {
    errorMap: () => ({ message: 'El método de cobro debe ser efectivo' }),
  }),
});

export const cambioEstadoSchema = z.object({
  estado: z.enum(ESTADOS_PEDIDO, {
    errorMap: () => ({ message: 'Estado de pedido inválido' }),
  }),
});

const estadoFiltroSchema = z.union([
  z.enum(ESTADOS_PEDIDO),
  z.array(z.enum(ESTADOS_PEDIDO)).nonempty(),
]);

export const pedidoFiltroSchema = z.object({
  estado: estadoFiltroSchema.optional(),
  origen: z.enum(['anticipado', 'mostrador'], {
    errorMap: () => ({ message: 'Origen de pedido inválido' }),
  }).optional(),
});

export type PedidoInput = z.infer<typeof pedidoInputSchema>;
export type PagoInput = z.infer<typeof pagoInputSchema>;
export type CrearMostradorInput = z.infer<typeof crearMostradorSchema>;
export type CobroInput = z.infer<typeof cobroSchema>;
export type CambioEstadoInput = z.infer<typeof cambioEstadoSchema>;
export type PedidoFiltroInput = z.infer<typeof pedidoFiltroSchema>;
