import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { query } from '../config/db';
import { ErrorConflicto, ErrorNoEncontrado } from '../utils/errors';
import { hashPassword } from '../utils/password';
import { esRolValido, type RolNombre } from '../utils/roles';
import type { UsuarioPublico } from '../tipos';
import { obtenerRolId } from './auth.service';
import type { ActualizarOperativoInput, CrearOperativoInput } from '../utils/schemas';

interface FilaOperativo extends RowDataPacket {
  id: number;
  nombre: string;
  correo: string;
  activo: number;
  rol: string;
}

const ROLES_OPERATIVOS: RolNombre[] = ['cajero', 'cocinero'];

const SELECT_OPERATIVOS = `
  SELECT u.id, u.nombre, u.correo, u.activo, r.nombre AS rol
    FROM usuario u
    JOIN rol r ON r.id = u.rol_id
   WHERE r.nombre IN ('cajero', 'cocinero')`;

function aUsuarioPublico(fila: FilaOperativo): UsuarioPublico {
  if (!esRolValido(fila.rol)) {
    throw new Error(`Rol desconocido en base de datos: ${fila.rol}`);
  }
  return {
    id: fila.id,
    nombre: fila.nombre,
    correo: fila.correo,
    rol: fila.rol,
    activo: Boolean(fila.activo),
  };
}

export async function listar(): Promise<UsuarioPublico[]> {
  const filas = await query<FilaOperativo[]>(`${SELECT_OPERATIVOS} ORDER BY u.nombre ASC`);
  return filas.map(aUsuarioPublico);
}

async function buscarOperativo(id: number): Promise<FilaOperativo> {
  const filas = await query<FilaOperativo[]>(`${SELECT_OPERATIVOS} AND u.id = ? LIMIT 1`, [id]);
  const fila = filas[0];
  if (!fila) {
    throw new ErrorNoEncontrado('Usuario operativo no encontrado');
  }
  return fila;
}

export async function crear(datos: CrearOperativoInput): Promise<UsuarioPublico> {
  const existentes = await query<RowDataPacket[]>(
    'SELECT id FROM usuario WHERE correo = ? LIMIT 1',
    [datos.correo],
  );
  if (existentes.length > 0) {
    throw new ErrorConflicto('El correo ya está en uso');
  }
  const hash = await hashPassword(datos.password);
  const rolId = await obtenerRolId(datos.rol);
  const resultado = await query<ResultSetHeader>(
    `INSERT INTO usuario (nombre, correo, password_hash, rol_id)
     VALUES (?, ?, ?, ?)`,
    [datos.nombre, datos.correo, hash, rolId],
  );
  return {
    id: resultado.insertId,
    nombre: datos.nombre,
    correo: datos.correo,
    rol: datos.rol,
    activo: true,
  };
}

export async function actualizar(
  id: number,
  datos: ActualizarOperativoInput,
): Promise<UsuarioPublico> {
  const fila = await buscarOperativo(id);

  if (datos.correo && datos.correo !== fila.correo) {
    const existentes = await query<RowDataPacket[]>(
      'SELECT id FROM usuario WHERE correo = ? AND id <> ? LIMIT 1',
      [datos.correo, id],
    );
    if (existentes.length > 0) {
      throw new ErrorConflicto('El correo ya está en uso');
    }
  }

  const asignaciones: string[] = [];
  const valores: (string | number)[] = [];

  if (datos.nombre !== undefined) {
    asignaciones.push('nombre = ?');
    valores.push(datos.nombre);
  }
  if (datos.correo !== undefined) {
    asignaciones.push('correo = ?');
    valores.push(datos.correo);
  }
  if (datos.rol !== undefined) {
    asignaciones.push('rol_id = ?');
    valores.push(await obtenerRolId(datos.rol));
  }

  if (asignaciones.length > 0) {
    valores.push(id);
    await query<ResultSetHeader>(
      `UPDATE usuario SET ${asignaciones.join(', ')} WHERE id = ?`,
      valores,
    );
  }

  const actualizado = await buscarOperativo(id);
  return aUsuarioPublico(actualizado);
}

export async function deshabilitar(id: number): Promise<void> {
  await buscarOperativo(id);
  await query<ResultSetHeader>('UPDATE usuario SET activo = 0 WHERE id = ?', [id]);
}

export { ROLES_OPERATIVOS };
