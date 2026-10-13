import { z } from 'zod';

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

export type PedidoInput = z.infer<typeof pedidoInputSchema>;
export type PagoInput = z.infer<typeof pagoInputSchema>;
