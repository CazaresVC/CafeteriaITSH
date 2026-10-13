import type { Request, Response, NextFunction } from 'express';
import { ErrorDeDominio } from '../utils/errors';

interface ErrorConCodigo {
  code?: string;
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: { codigo: 'NO_ENCONTRADO', mensaje: 'Recurso no encontrado' },
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ErrorDeDominio) {
    res.status(error.status).json({
      error: { codigo: error.codigo, mensaje: error.message },
    });
    return;
  }

  const codigoMysql = (error as ErrorConCodigo | undefined)?.code;
  if (codigoMysql === 'ER_DUP_ENTRY') {
    res.status(409).json({
      error: { codigo: 'CONFLICTO', mensaje: 'El recurso ya existe' },
    });
    return;
  }

  console.error('[errorHandler] Error no controlado:', error);
  res.status(500).json({
    error: { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error inesperado' },
  });
}
