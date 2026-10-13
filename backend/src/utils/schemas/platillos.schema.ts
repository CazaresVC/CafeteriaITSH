import { z } from 'zod';

export const nombrePlatilloSchema = z
  .string()
  .trim()
  .min(1, 'El nombre es obligatorio')
  .max(100, 'El nombre es demasiado largo');

export const categoriaSchema = z
  .string()
  .trim()
  .max(50, 'La categoría es demasiado larga');

export const descripcionSchema = z
  .string()
  .trim()
  .max(1000, 'La descripción es demasiado larga');

export const platilloInputSchema = z.object({
  nombre: nombrePlatilloSchema,
  categoria: categoriaSchema.optional(),
  descripcion: descripcionSchema.optional(),
  activo: z.boolean().optional(),
});

export const platilloPatchSchema = z
  .object({
    nombre: nombrePlatilloSchema.optional(),
    categoria: categoriaSchema.nullable().optional(),
    descripcion: descripcionSchema.nullable().optional(),
    activo: z.boolean().optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'No hay campos para actualizar',
  });

export type PlatilloInput = z.infer<typeof platilloInputSchema>;
export type PlatilloPatch = z.infer<typeof platilloPatchSchema>;
