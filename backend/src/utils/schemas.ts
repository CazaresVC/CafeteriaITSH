import { z } from 'zod';

export const correoSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Correo inválido')
  .max(150, 'El correo es demasiado largo');

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña es demasiado larga');

export const nombreSchema = z
  .string()
  .trim()
  .min(1, 'El nombre es obligatorio')
  .max(100, 'El nombre es demasiado largo');

export const registroSchema = z.object({
  nombre: nombreSchema,
  correo: correoSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  correo: correoSchema,
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const crearOperativoSchema = z.object({
  nombre: nombreSchema,
  correo: correoSchema,
  password: passwordSchema,
  rol: z.enum(['cajero', 'cocinero'], {
    errorMap: () => ({ message: 'El rol debe ser cajero o cocinero' }),
  }),
});

export const actualizarOperativoSchema = z
  .object({
    nombre: nombreSchema.optional(),
    correo: correoSchema.optional(),
    rol: z.enum(['cajero', 'cocinero']).optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'No hay campos para actualizar',
  });

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('Identificador inválido'),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CrearOperativoInput = z.infer<typeof crearOperativoSchema>;
export type ActualizarOperativoInput = z.infer<typeof actualizarOperativoSchema>;
