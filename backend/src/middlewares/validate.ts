import type { RequestHandler } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { ErrorValidacion } from '../utils/errors';

type Fuente = 'body' | 'query' | 'params';

function formatear(error: ZodError): string {
  const primero = error.issues[0];
  if (!primero) {
    return 'Datos inválidos';
  }
  const campo = primero.path.join('.');
  return campo ? `${campo}: ${primero.message}` : primero.message;
}

export function validate(schema: ZodTypeAny, fuente: Fuente = 'body'): RequestHandler {
  return (req, _res, next) => {
    const resultado = schema.safeParse(req[fuente]);
    if (!resultado.success) {
      return next(new ErrorValidacion(formatear(resultado.error)));
    }
    (req as unknown as Record<Fuente, unknown>)[fuente] = resultado.data;
    next();
  };
}
