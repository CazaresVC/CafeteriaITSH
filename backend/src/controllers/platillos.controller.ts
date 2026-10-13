import type { RequestHandler } from 'express';
import * as platillosService from '../services/platillos.service';
import type { PlatilloInput, PlatilloPatch } from '../utils/schemas/platillos.schema';

function filtroActivo(valor: unknown): boolean | undefined {
  if (valor === 'true' || valor === '1') {
    return true;
  }
  if (valor === 'false' || valor === '0') {
    return false;
  }
  return undefined;
}

export const listar: RequestHandler = async (req, res, next) => {
  try {
    const activo = filtroActivo(req.query.activo);
    const platillos = await platillosService.listar(activo === undefined ? {} : { activo });
    res.status(200).json(platillos);
  } catch (error) {
    next(error);
  }
};

export const crear: RequestHandler = async (req, res, next) => {
  try {
    const platillo = await platillosService.crear(req.body as PlatilloInput);
    res.status(201).json(platillo);
  } catch (error) {
    next(error);
  }
};

export const editar: RequestHandler = async (req, res, next) => {
  try {
    const platillo = await platillosService.editar(
      Number(req.params.id),
      req.body as PlatilloPatch,
    );
    res.status(200).json(platillo);
  } catch (error) {
    next(error);
  }
};

export const desactivar: RequestHandler = async (req, res, next) => {
  try {
    await platillosService.desactivar(Number(req.params.id));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
