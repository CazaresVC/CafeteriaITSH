import type { RowDataPacket } from 'mysql2/promise';
import { conTransaccion, query } from '../config/db';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorPagoRechazado,
  ErrorProhibido,
} from '../utils/errors';
import {
  PAGADO,
  PENDIENTE,
  obtenerEstadoId,
  registrarCambio,
  validarTransicion,
} from './estado.service';
import { pasarela } from '../utils/payment/gateway';
import { obtener } from './pedidos.service';
import type { Pedido } from '../tipos';

interface FilaPedidoPago extends RowDataPacket {
  id: number;
  usuarioId: number | null;
  total: string | number;
  estadoId: number;
  estado: string;
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export async function pagar(
  pedidoId: number,
  usuarioId: number,
  tokenPago?: string,
): Promise<Pedido> {
  const filas = await query<FilaPedidoPago[]>(
    `SELECT pe.id,
            pe.usuario_id AS usuarioId,
            pe.total,
            pe.estado_id AS estadoId,
            e.nombre AS estado
       FROM pedido pe
       JOIN estado_pedido e ON e.id = pe.estado_id
      WHERE pe.id = ?
      LIMIT 1`,
    [pedidoId],
  );
  const pedido = filas[0];
  if (!pedido) {
    throw new ErrorNoEncontrado('Pedido no encontrado');
  }
  if (pedido.usuarioId !== usuarioId) {
    throw new ErrorProhibido('El pedido pertenece a otro usuario');
  }

  if (pedido.estado === PAGADO) {
    return obtener(pedidoId, usuarioId);
  }
  if (pedido.estado !== PENDIENTE) {
    throw new ErrorConflicto('El pedido no está en un estado que permita pagarse');
  }

  const total = redondear(Number(pedido.total));
  const resultado = await pasarela.cobrar(total, tokenPago);
  if (!resultado.aprobado) {
    throw new ErrorPagoRechazado(resultado.motivo);
  }

  const estadoPagadoId = await obtenerEstadoId(PAGADO);
  await validarTransicion(pedido.estadoId, estadoPagadoId);

  await conTransaccion(async (conn) => {
    await conn.execute(
      `INSERT INTO pago (pedido_id, metodo, monto, referencia, registrado_por)
       VALUES (?, 'online', ?, ?, ?)`,
      [pedidoId, total, resultado.referencia, usuarioId],
    );
    await registrarCambio(conn, pedidoId, pedido.estadoId, estadoPagadoId, usuarioId);
  });

  return obtener(pedidoId, usuarioId);
}

export async function registrarCobro(pedidoId: number, cajeroId: number): Promise<Pedido> {
  const estadoPagadoId = await obtenerEstadoId(PAGADO);

  await conTransaccion(async (conn) => {
    const [filas] = await conn.execute<FilaPedidoPago[]>(
      `SELECT pe.id,
              pe.usuario_id AS usuarioId,
              pe.total,
              pe.estado_id AS estadoId,
              e.nombre AS estado
         FROM pedido pe
         JOIN estado_pedido e ON e.id = pe.estado_id
        WHERE pe.id = ?
        FOR UPDATE`,
      [pedidoId],
    );
    const pedido = filas[0];
    if (!pedido) {
      throw new ErrorNoEncontrado('Pedido no encontrado');
    }
    if (pedido.estado !== PENDIENTE) {
      throw new ErrorConflicto('El pedido no está pendiente de cobro');
    }

    const total = redondear(Number(pedido.total));
    await conn.execute(
      `INSERT INTO pago (pedido_id, metodo, monto, referencia, registrado_por)
       VALUES (?, 'efectivo', ?, NULL, ?)`,
      [pedidoId, total, cajeroId],
    );
    await validarTransicion(pedido.estadoId, estadoPagadoId, conn);
    await registrarCambio(conn, pedidoId, pedido.estadoId, estadoPagadoId, cajeroId);
  });

  return obtener(pedidoId, undefined, { incluirHistorial: true });
}
