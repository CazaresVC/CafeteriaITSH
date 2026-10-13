import type { Request, Response, NextFunction, RequestHandler } from 'express';
import * as usuariosService from '../services/usuarios.service';
import type { ActualizarOperativoInput, CrearOperativoInput } from '../utils/schemas';

export const listar: RequestHandler = async (_req, res, next) => {
  try {
    const usuarios = await usuariosService.listar();
    res.status(200).json(usuarios);
  } catch (error) {
    next(error);
  }
};

export const crear: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const usuario = await usuariosService.crear(req.body as CrearOperativoInput);
    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
};

export const actualizar: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const usuario = await usuariosService.actualizar(id, req.body as ActualizarOperativoInput);
    res.status(200).json(usuario);
  } catch (error) {
    next(error);
  }
};

export const deshabilitar: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await usuariosService.deshabilitar(Number(req.params.id));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
