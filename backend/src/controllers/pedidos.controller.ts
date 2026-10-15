import type { RequestHandler } from 'express';
import * as pedidosService from '../services/pedidos.service';
import * as pagoService from '../services/pago.service';
import { ErrorNoAutorizado, ErrorValidacion } from '../utils/errors';
import { pedidoFiltroSchema } from '../utils/schemas/pedidos.schema';
import type {
  CambioEstadoInput,
  CrearMostradorInput,
  PagoInput,
  PedidoInput,
} from '../utils/schemas/pedidos.schema';

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

export const crearMostrador: RequestHandler = async (req, res, next) => {
  try {
    const cajeroId = usuarioIdRequerido(req);
    const datos = req.body as CrearMostradorInput;
    const pedido = await pedidosService.crearMostrador(cajeroId, datos);
    res.status(201).json(pedido);
  } catch (error) {
    next(error);
  }
};

export const listar: RequestHandler = async (req, res, next) => {
  try {
    const resultado = pedidoFiltroSchema.safeParse(req.query);
    if (!resultado.success) {
      throw new ErrorValidacion('Filtros de pedidos inválidos');
    }
    const { estado, origen } = resultado.data;
    const estados = estado === undefined ? undefined : Array.isArray(estado) ? estado : [estado];
    const pedidos = await pedidosService.listarPedidos({ estados, origen });
    res.status(200).json(pedidos);
  } catch (error) {
    next(error);
  }
};

export const listarMios: RequestHandler = async (req, res, next) => {
  try {
    const usuarioId = usuarioIdRequerido(req);
    const pedidos = await pedidosService.listarMios(usuarioId);
    res.status(200).json(pedidos);
  } catch (error) {
    next(error);
  }
};

export const obtener: RequestHandler = async (req, res, next) => {
  try {
    const usuario = req.usuario;
    if (!usuario) {
      throw new ErrorNoAutorizado();
    }
    const id = Number(req.params.id);
    if (usuario.rol === 'usuario') {
      const pedido = await pedidosService.obtener(id, usuario.id);
      res.status(200).json(pedido);
      return;
    }
    const pedido = await pedidosService.obtener(id, undefined, { incluirHistorial: true });
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

export const cobrar: RequestHandler = async (req, res, next) => {
  try {
    const cajeroId = usuarioIdRequerido(req);
    const pedido = await pagoService.registrarCobro(Number(req.params.id), cajeroId);
    res.status(200).json(pedido);
  } catch (error) {
    next(error);
  }
};

export const cambiarEstado: RequestHandler = async (req, res, next) => {
  try {
    const usuarioId = usuarioIdRequerido(req);
    const datos = req.body as CambioEstadoInput;
    const pedido = await pedidosService.cambiarEstado(
      Number(req.params.id),
      datos.estado,
      usuarioId,
    );
    res.status(200).json(pedido);
  } catch (error) {
    next(error);
  }
};
