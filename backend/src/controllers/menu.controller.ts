import type { RequestHandler } from 'express';
import * as menuService from '../services/menu.service';
import { ErrorValidacion } from '../utils/errors';
import { menuFiltroSchema } from '../utils/schemas/menu.schema';
import type { MenuItemInput, MenuItemPatch } from '../utils/schemas/menu.schema';

function hoyISO(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

export const listar: RequestHandler = async (req, res, next) => {
  try {
    const resultado = menuFiltroSchema.safeParse(req.query);
    if (!resultado.success) {
      const primer = resultado.error.issues[0];
      throw new ErrorValidacion(primer ? primer.message : 'Parámetros inválidos');
    }
    const fecha = resultado.data.fecha ?? hoyISO();
    const items = await menuService.listarPorFecha(fecha);
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const agregar: RequestHandler = async (req, res, next) => {
  try {
    const item = await menuService.agregar(req.body as MenuItemInput);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const actualizar: RequestHandler = async (req, res, next) => {
  try {
    const item = await menuService.actualizar(Number(req.params.id), req.body as MenuItemPatch);
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

export const quitar: RequestHandler = async (req, res, next) => {
  try {
    await menuService.quitar(Number(req.params.id));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
