import { z } from 'zod';

export const fechaSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato YYYY-MM-DD')
  .refine((valor) => !Number.isNaN(Date.parse(valor)), 'La fecha no es válida');

function tieneHastaDosDecimales(valor: number): boolean {
  return Math.abs(valor * 100 - Math.round(valor * 100)) < 1e-9;
}

export const precioSchema = z
  .number({ invalid_type_error: 'El precio debe ser numérico' })
  .nonnegative('El precio no puede ser negativo')
  .max(99999999.99, 'El precio es demasiado alto')
  .refine(tieneHastaDosDecimales, 'El precio admite como máximo 2 decimales');

export const menuFiltroSchema = z.object({
  fecha: fechaSchema.optional(),
});

export const menuItemInputSchema = z.object({
  fecha: fechaSchema,
  platilloId: z.coerce.number().int().positive('Platillo inválido'),
  precio: precioSchema,
  disponible: z.boolean().optional(),
  especial: z.boolean().optional(),
});

export const menuItemPatchSchema = z
  .object({
    precio: precioSchema.optional(),
    disponible: z.boolean().optional(),
    especial: z.boolean().optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'No hay campos para actualizar',
  });

export type MenuFiltro = z.infer<typeof menuFiltroSchema>;
export type MenuItemInput = z.infer<typeof menuItemInputSchema>;
export type MenuItemPatch = z.infer<typeof menuItemPatchSchema>;
