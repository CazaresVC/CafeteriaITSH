import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import type { Parametro } from '../config/db';
import { query } from '../config/db';
import { ErrorConflicto, ErrorNoEncontrado } from '../utils/errors';
import type { MenuItem, ResultadoRepublicacion } from '../tipos';
import type { MenuItemInput, MenuItemPatch } from '../utils/schemas/menu.schema';

interface FilaPlatillo extends RowDataPacket {
  id: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  activo: number;
}

interface FilaItem extends RowDataPacket {
  id: number;
  fecha: string;
  platilloId: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  precio: string | number;
  disponible: number;
  especial: number;
}

const SELECT_ITEMS = `
  SELECT m.id,
         m.fecha,
         m.platillo_id AS platilloId,
         p.nombre,
         p.categoria,
         p.descripcion,
         m.precio,
         m.disponible,
         m.especial
    FROM menu_dia m
    JOIN platillo p ON p.id = m.platillo_id`;

function aItem(fila: FilaItem): MenuItem {
  return {
    id: fila.id,
    fecha: fila.fecha,
    platilloId: fila.platilloId,
    nombre: fila.nombre,
    categoria: fila.categoria,
    descripcion: fila.descripcion,
    precio: Number(fila.precio),
    disponible: Boolean(fila.disponible),
    especial: Boolean(fila.especial),
  };
}

async function buscarItem(id: number): Promise<FilaItem> {
  const filas = await query<FilaItem[]>(`${SELECT_ITEMS} WHERE m.id = ? LIMIT 1`, [id]);
  const fila = filas[0];
  if (!fila) {
    throw new ErrorNoEncontrado('Ítem del menú no encontrado');
  }
  return fila;
}

export async function listarPorFecha(fecha: string): Promise<MenuItem[]> {
  const filas = await query<FilaItem[]>(
    `${SELECT_ITEMS}
      WHERE m.fecha = ? AND p.activo = 1
      ORDER BY m.especial DESC, p.nombre ASC`,
    [fecha],
  );
  return filas.map(aItem);
}

export async function agregar(datos: MenuItemInput): Promise<MenuItem> {
  const platillos = await query<FilaPlatillo[]>(
    'SELECT id, nombre, categoria, descripcion, activo FROM platillo WHERE id = ? LIMIT 1',
    [datos.platilloId],
  );
  const platillo = platillos[0];
  if (!platillo) {
    throw new ErrorNoEncontrado('Platillo no encontrado');
  }
  if (!platillo.activo) {
    throw new ErrorConflicto('El platillo no está activo y no puede agregarse al menú');
  }

  const duplicados = await query<RowDataPacket[]>(
    'SELECT id FROM menu_dia WHERE fecha = ? AND platillo_id = ? LIMIT 1',
    [datos.fecha, datos.platilloId],
  );
  if (duplicados.length > 0) {
    throw new ErrorConflicto('El platillo ya está en el menú de esa fecha');
  }

  const disponible = datos.disponible ?? true;
  const especial = datos.especial ?? false;

  const resultado = await query<ResultSetHeader>(
    `INSERT INTO menu_dia (fecha, platillo_id, precio, disponible, especial)
     VALUES (?, ?, ?, ?, ?)`,
    [datos.fecha, datos.platilloId, datos.precio, disponible ? 1 : 0, especial ? 1 : 0],
  );

  return {
    id: resultado.insertId,
    fecha: datos.fecha,
    platilloId: datos.platilloId,
    nombre: platillo.nombre,
    categoria: platillo.categoria,
    descripcion: platillo.descripcion,
    precio: datos.precio,
    disponible,
    especial,
  };
}

export async function actualizar(id: number, datos: MenuItemPatch): Promise<MenuItem> {
  const fila = await buscarItem(id);

  const asignaciones: string[] = [];
  const valores: Parametro[] = [];

  if (datos.precio !== undefined) {
    asignaciones.push('precio = ?');
    valores.push(datos.precio);
  }
  if (datos.disponible !== undefined) {
    asignaciones.push('disponible = ?');
    valores.push(datos.disponible ? 1 : 0);
  }
  if (datos.especial !== undefined) {
    asignaciones.push('especial = ?');
    valores.push(datos.especial ? 1 : 0);
  }

  if (asignaciones.length > 0) {
    valores.push(id);
    await query<ResultSetHeader>(`UPDATE menu_dia SET ${asignaciones.join(', ')} WHERE id = ?`, valores);
  }

  return {
    ...aItem(fila),
    precio: datos.precio ?? Number(fila.precio),
    disponible: datos.disponible ?? Boolean(fila.disponible),
    especial: datos.especial ?? Boolean(fila.especial),
  };
}

export async function quitar(id: number): Promise<void> {
  await buscarItem(id);
  await query<ResultSetHeader>('DELETE FROM menu_dia WHERE id = ?', [id]);
}

interface FilaOrigen extends RowDataPacket {
  origen: string | null;
}

interface FilaConteo extends RowDataPacket {
  total: number;
}

export async function republicar(fechaDestino: string): Promise<ResultadoRepublicacion> {
  const origenFilas = await query<FilaOrigen[]>(
    'SELECT MAX(fecha) AS origen FROM menu_dia WHERE fecha <> ?',
    [fechaDestino],
  );
  const origen = origenFilas[0]?.origen ?? null;
  if (!origen) {
    throw new ErrorNoEncontrado('No hay un menú previo para republicar');
  }

  const conteoFilas = await query<FilaConteo[]>(
    `SELECT COUNT(*) AS total
       FROM menu_dia m
       JOIN platillo p ON p.id = m.platillo_id AND p.activo = 1
      WHERE m.fecha = ?`,
    [origen],
  );
  const origenTotal = Number(conteoFilas[0]?.total ?? 0);

  const resultado = await query<ResultSetHeader>(
    `INSERT INTO menu_dia (fecha, platillo_id, precio, disponible, especial)
     SELECT ?, m.platillo_id, m.precio, m.disponible, m.especial
       FROM menu_dia m
       JOIN platillo p ON p.id = m.platillo_id AND p.activo = 1
      WHERE m.fecha = ?
        AND NOT EXISTS (
          SELECT 1 FROM menu_dia d
           WHERE d.fecha = ? AND d.platillo_id = m.platillo_id
        )`,
    [fechaDestino, origen, fechaDestino],
  );

  const agregados = resultado.affectedRows;
  return {
    fecha: fechaDestino,
    origen,
    agregados,
    omitidos: Math.max(0, origenTotal - agregados),
  };
}
