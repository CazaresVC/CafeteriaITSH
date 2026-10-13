import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ErrorNoAutorizado, ErrorProhibido } from '../utils/errors';
import type { RolNombre } from '../utils/roles';

export function requireRole(...rolesPermitidos: RolNombre[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const usuario = req.usuario;
    if (!usuario) {
      return next(new ErrorNoAutorizado());
    }
    if (!rolesPermitidos.includes(usuario.rol)) {
      return next(new ErrorProhibido());
    }
    next();
  };
}
