import type { RowDataPacket } from 'mysql2/promise';
import { query } from '../config/db';
import { ErrorNoEncontrado } from '../utils/errors';
import { obtenerProveedor } from './notificacion.provider';
import type { CanalNotificacion } from './notificacion.provider';
import type { PedidoListoEvento } from './eventosPedido';

export const TIPO_PEDIDO_LISTO = 'pedido_listo';

const LARGO_MAX_DETALLE = 200;

export interface Notificacion {
  id: number;
  pedidoId: number;
  numero: string;
  tipo: string;
  canal: string;
  estadoEnvio: string;
  fecha: string;
  vista: boolean;
  detalleError: string | null;
}

interface FilaNotificacion extends RowDataPacket {
  id: number;
  pedidoId: number;
  numero: string;
  tipo: string;
  canal: string;
  estadoEnvio: string;
  fecha: string;
  vista: number;
  detalleError: string | null;
}

function acotar(mensaje: string): string {
  return mensaje.length > LARGO_MAX_DETALLE ? mensaje.slice(0, LARGO_MAX_DETALLE) : mensaje;
}

function mapear(fila: FilaNotificacion): Notificacion {
  return {
    id: fila.id,
    pedidoId: fila.pedidoId,
    numero: fila.numero,
    tipo: fila.tipo,
    canal: fila.canal,
    estadoEnvio: fila.estadoEnvio,
    fecha: fila.fecha,
    vista: fila.vista === 1,
    detalleError: fila.detalleError ?? null,
  };
}

async function actualizarEstado(
  pedidoId: number,
  estadoEnvio: 'enviada' | 'fallida',
  detalleError: string | null,
): Promise<void> {
  await query(
    `UPDATE notificacion SET estado_envio = ?, detalle_error = ?
      WHERE pedido_id = ? AND tipo = ?`,
    [estadoEnvio, detalleError, pedidoId, TIPO_PEDIDO_LISTO],
  );
}

export async function emitirPedidoListo(evento: PedidoListoEvento): Promise<void> {
  const proveedor = obtenerProveedor();
  const canal: CanalNotificacion = proveedor.canal;

  await query(
    `INSERT INTO notificacion (pedido_id, tipo, canal, estado_envio)
     VALUES (?, ?, ?, 'pendiente')
     ON DUPLICATE KEY UPDATE canal = VALUES(canal), estado_envio = 'pendiente', detalle_error = NULL`,
    [evento.pedidoId, TIPO_PEDIDO_LISTO, canal],
  );

  const resultado = await proveedor.enviar({
    tipo: TIPO_PEDIDO_LISTO,
    numero: evento.numero,
    pedidoId: evento.pedidoId,
    destinatarioUsuarioId: evento.usuarioId,
  });

  if (resultado.exito) {
    await actualizarEstado(evento.pedidoId, 'enviada', null);
  } else {
    await actualizarEstado(evento.pedidoId, 'fallida', acotar(resultado.detalleError ?? 'Error de envío'));
  }
}

export async function listarMias(usuarioId: number): Promise<Notificacion[]> {
  const filas = await query<FilaNotificacion[]>(
    `SELECT n.id,
            n.pedido_id AS pedidoId,
            p.numero,
            n.tipo,
            n.canal,
            n.estado_envio AS estadoEnvio,
            n.fecha,
            n.vista,
            n.detalle_error AS detalleError
       FROM notificacion n
       JOIN pedido p ON p.id = n.pedido_id
      WHERE p.usuario_id = ?
      ORDER BY n.fecha DESC, n.id DESC`,
    [usuarioId],
  );
  return filas.map(mapear);
}

export async function marcarVista(
  notificacionId: number,
  usuarioId: number,
): Promise<Notificacion> {
  const filas = await query<FilaNotificacion[]>(
    `SELECT n.id,
            n.pedido_id AS pedidoId,
            p.numero,
            n.tipo,
            n.canal,
            n.estado_envio AS estadoEnvio,
            n.fecha,
            n.vista,
            n.detalle_error AS detalleError
       FROM notificacion n
       JOIN pedido p ON p.id = n.pedido_id
      WHERE n.id = ? AND p.usuario_id = ?
      LIMIT 1`,
    [notificacionId, usuarioId],
  );
  const fila = filas[0];
  if (!fila) {
    throw new ErrorNoEncontrado('Notificación no encontrada');
  }

  await query('UPDATE notificacion SET vista = 1 WHERE id = ?', [notificacionId]);
  return mapear({ ...fila, vista: 1 });
}

export async function reintentarFallidas(): Promise<number> {
  const filas = await query<FilaNotificacion[]>(
    `SELECT n.id,
            n.pedido_id AS pedidoId,
            p.numero,
            n.tipo,
            n.canal,
            n.estado_envio AS estadoEnvio,
            n.fecha,
            n.vista,
            n.detalle_error AS detalleError
       FROM notificacion n
       JOIN pedido p ON p.id = n.pedido_id
      WHERE n.tipo = ? AND n.estado_envio = 'fallida'
      ORDER BY n.id ASC`,
    [TIPO_PEDIDO_LISTO],
  );

  const proveedor = obtenerProveedor();
  let enviadas = 0;
  for (const fila of filas) {
    const resultado = await proveedor.enviar({
      tipo: fila.tipo,
      numero: fila.numero,
      pedidoId: fila.pedidoId,
      destinatarioUsuarioId: null,
    });
    if (resultado.exito) {
      await actualizarEstado(fila.pedidoId, 'enviada', null);
      enviadas += 1;
    } else {
      await actualizarEstado(fila.pedidoId, 'fallida', acotar(resultado.detalleError ?? 'Error de envío'));
    }
  }
  return enviadas;
}
