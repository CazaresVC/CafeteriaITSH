import type { RequestHandler } from 'express';
import * as notificacionesService from '../services/notificaciones.service';
import { ErrorNoAutorizado } from '../utils/errors';

function usuarioIdRequerido(req: Parameters<RequestHandler>[0]): number {
  const usuario = req.usuario;
  if (!usuario) {
    throw new ErrorNoAutorizado();
  }
  return usuario.id;
}

export const listarMias: RequestHandler = async (req, res, next) => {
  try {
    const usuarioId = usuarioIdRequerido(req);
    const notificaciones = await notificacionesService.listarMias(usuarioId);
    res.status(200).json(notificaciones);
  } catch (error) {
    next(error);
  }
};

export const marcarVista: RequestHandler = async (req, res, next) => {
  try {
    const usuarioId = usuarioIdRequerido(req);
    const notificacion = await notificacionesService.marcarVista(
      Number(req.params.id),
      usuarioId,
    );
    res.status(200).json(notificacion);
  } catch (error) {
    next(error);
  }
};

export const reintentar: RequestHandler = async (_req, res, next) => {
  try {
    const enviadas = await notificacionesService.reintentarFallidas();
    res.status(200).json({ enviadas });
  } catch (error) {
    next(error);
  }
};
