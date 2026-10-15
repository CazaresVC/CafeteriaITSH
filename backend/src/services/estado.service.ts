import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { query } from '../config/db';
import { ErrorConflicto, ErrorDeDominio } from '../utils/errors';

export const PENDIENTE = 'Pendiente';
export const PAGADO = 'Pagado';
export const EN_PREPARACION = 'En preparación';
export const LISTO = 'Listo';
export const ENTREGADO = 'Entregado';
export const CANCELADO = 'Cancelado';

export const ESTADOS_PEDIDO = [
  PENDIENTE,
  PAGADO,
  EN_PREPARACION,
  LISTO,
  ENTREGADO,
  CANCELADO,
] as const;

export type EstadoNombre = (typeof ESTADOS_PEDIDO)[number];

interface FilaEstado extends RowDataPacket {
  id: number;
}

export async function obtenerEstadoId(nombre: string): Promise<number> {
  const filas = await query<FilaEstado[]>(
    'SELECT id FROM estado_pedido WHERE nombre = ? LIMIT 1',
    [nombre],
  );
  const fila = filas[0];
  if (!fila) {
    throw new ErrorDeDominio(
      'ESTADO_NO_CONFIGURADO',
      500,
      `El estado de pedido "${nombre}" no está configurado`,
    );
  }
  return fila.id;
}

export async function validarTransicion(
  origenId: number,
  destinoId: number,
  conn?: PoolConnection,
): Promise<void> {
  const sql = 'SELECT desde_id FROM transicion_estado WHERE desde_id = ? AND hacia_id = ? LIMIT 1';
  const parametros = [origenId, destinoId];
  const filas = conn
    ? (await conn.execute<RowDataPacket[]>(sql, parametros))[0]
    : await query<RowDataPacket[]>(sql, parametros);
  if (filas.length === 0) {
    throw new ErrorConflicto('La transición de estado no está permitida');
  }
}

export async function registrarCambio(
  conn: PoolConnection,
  pedidoId: number,
  desdeId: number | null,
  haciaId: number,
  usuarioId: number | null,
): Promise<void> {
  await conn.execute('UPDATE pedido SET estado_id = ? WHERE id = ?', [haciaId, pedidoId]);
  await conn.execute(
    `INSERT INTO pedido_estado_historial (pedido_id, estado_anterior_id, estado_nuevo_id, cambiado_por)
     VALUES (?, ?, ?, ?)`,
    [pedidoId, desdeId, haciaId, usuarioId],
  );
}
