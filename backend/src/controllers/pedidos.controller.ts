import type { RequestHandler } from 'express';
import * as pedidosService from '../services/pedidos.service';
import * as pagoService from '../services/pago.service';
import { ErrorNoAutorizado } from '../utils/errors';
import type { PedidoInput, PagoInput } from '../utils/schemas/pedidos.schema';

function usuarioIdRequerido(req: Parameters<RequestHandler>[0]): number {
  const usuario = req.usuario;
  if (!usuario) {
    throw new ErrorNoAutorizado();
  }
  return usuario.id;
}

export const crear: RequestHandler = async (req, res, next) => {
  try {
    const usuarioId = usuarioIdRequerido(req);
    const datos = req.body as PedidoInput;
    const pedido = await pedidosService.crear(usuarioId, datos.lineas);
    res.status(201).json(pedido);
  } catch (error) {
    next(error);
  }
};

export const obtener: RequestHandler = async (req, res, next) => {
  try {
    const usuarioId = usuarioIdRequerido(req);
    const pedido = await pedidosService.obtener(Number(req.params.id), usuarioId);
    res.status(200).json(pedido);
  } catch (error) {
    next(error);
  }
};

export const pagar: RequestHandler = async (req, res, next) => {
  try {
    const usuarioId = usuarioIdRequerido(req);
    const datos = req.body as PagoInput;
    const pedido = await pagoService.pagar(Number(req.params.id), usuarioId, datos.tokenPago);
    res.status(200).json(pedido);
  } catch (error) {
    next(error);
  }
};
