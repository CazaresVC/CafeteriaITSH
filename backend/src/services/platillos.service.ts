import type { Parametro } from '../config/db';
import { query } from '../config/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { ErrorNoEncontrado } from '../utils/errors';
import type { Platillo } from '../tipos';
import type { PlatilloInput, PlatilloPatch } from '../utils/schemas/platillos.schema';

interface FilaPlatillo extends RowDataPacket {
  id: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  activo: number;
}

const CAMPOS = 'id, nombre, categoria, descripcion, activo';

function aPlatillo(fila: FilaPlatillo): Platillo {
  return {
    id: fila.id,
    nombre: fila.nombre,
    categoria: fila.categoria,
    descripcion: fila.descripcion,
    activo: Boolean(fila.activo),
  };
}

async function buscarPlatillo(id: number): Promise<FilaPlatillo> {
  const filas = await query<FilaPlatillo[]>(
    `SELECT ${CAMPOS} FROM platillo WHERE id = ? LIMIT 1`,
    [id],
  );
  const fila = filas[0];
  if (!fila) {
    throw new ErrorNoEncontrado('Platillo no encontrado');
  }
  return fila;
}

export async function listar(filtro: { activo?: boolean } = {}): Promise<Platillo[]> {
  const condiciones: string[] = [];
  const valores: Parametro[] = [];
  if (filtro.activo !== undefined) {
    condiciones.push('activo = ?');
    valores.push(filtro.activo ? 1 : 0);
  }
  const where = condiciones.length > 0 ? ` WHERE ${condiciones.join(' AND ')}` : '';
  const filas = await query<FilaPlatillo[]>(
    `SELECT ${CAMPOS} FROM platillo${where} ORDER BY nombre ASC`,
    valores,
  );
  return filas.map(aPlatillo);
}

export async function crear(datos: PlatilloInput): Promise<Platillo> {
  const activo = datos.activo ?? true;
  const resultado = await query<ResultSetHeader>(
    `INSERT INTO platillo (nombre, categoria, descripcion, activo)
     VALUES (?, ?, ?, ?)`,
    [datos.nombre, datos.categoria ?? null, datos.descripcion ?? null, activo ? 1 : 0],
  );
  return {
    id: resultado.insertId,
    nombre: datos.nombre,
    categoria: datos.categoria ?? null,
    descripcion: datos.descripcion ?? null,
    activo,
  };
}

export async function editar(id: number, datos: PlatilloPatch): Promise<Platillo> {
  const fila = await buscarPlatillo(id);

  const asignaciones: string[] = [];
  const valores: Parametro[] = [];

  if (datos.nombre !== undefined) {
    asignaciones.push('nombre = ?');
    valores.push(datos.nombre);
  }
  if ('categoria' in datos) {
    asignaciones.push('categoria = ?');
    valores.push(datos.categoria ?? null);
  }
  if ('descripcion' in datos) {
    asignaciones.push('descripcion = ?');
    valores.push(datos.descripcion ?? null);
  }
  if (datos.activo !== undefined) {
    asignaciones.push('activo = ?');
    valores.push(datos.activo ? 1 : 0);
  }

  if (asignaciones.length > 0) {
    valores.push(id);
    await query<ResultSetHeader>(`UPDATE platillo SET ${asignaciones.join(', ')} WHERE id = ?`, valores);
  }

  return {
    id,
    nombre: datos.nombre ?? fila.nombre,
    categoria: 'categoria' in datos ? (datos.categoria ?? null) : fila.categoria,
    descripcion: 'descripcion' in datos ? (datos.descripcion ?? null) : fila.descripcion,
    activo: datos.activo ?? Boolean(fila.activo),
  };
}

export async function desactivar(id: number): Promise<void> {
  await buscarPlatillo(id);
  await query<ResultSetHeader>('UPDATE platillo SET activo = 0 WHERE id = ?', [id]);
}
