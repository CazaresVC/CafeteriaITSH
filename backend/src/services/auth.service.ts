import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { query } from '../config/db';
import { ErrorConflicto, ErrorCredenciales, ErrorNoEncontrado } from '../utils/errors';
import { hashPassword, verificarPassword } from '../utils/password';
import { esRolValido } from '../utils/roles';
import type { UsuarioPublico } from '../tipos';

interface FilaUsuario extends RowDataPacket {
  id: number;
  nombre: string;
  correo: string;
  password_hash: string;
  activo: number;
  rol: string;
}

const SELECT_USUARIO = `
  SELECT u.id, u.nombre, u.correo, u.password_hash, u.activo, r.nombre AS rol
    FROM usuario u
    JOIN rol r ON r.id = u.rol_id`;

function aUsuarioPublico(fila: FilaUsuario): UsuarioPublico {
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

export async function obtenerRolId(nombre: string): Promise<number> {
  const filas = await query<RowDataPacket[]>(
    'SELECT id FROM rol WHERE nombre = ? LIMIT 1',
    [nombre],
  );
  const fila = filas[0] as { id?: number } | undefined;
  if (!fila || typeof fila.id !== 'number') {
    throw new Error(`Rol no encontrado en la base de datos: ${nombre}`);
  }
  return fila.id;
}

export async function autenticar(correo: string, password: string): Promise<UsuarioPublico> {
  const filas = await query<FilaUsuario[]>(
    `${SELECT_USUARIO} WHERE u.correo = ? LIMIT 1`,
    [correo],
  );
  const fila = filas[0];
  if (!fila) {
    throw new ErrorCredenciales();
  }
  const coincide = await verificarPassword(password, fila.password_hash);
  if (!coincide || !fila.activo) {
    throw new ErrorCredenciales();
  }
  return aUsuarioPublico(fila);
}

export async function obtenerPorId(id: number): Promise<UsuarioPublico> {
  const filas = await query<FilaUsuario[]>(`${SELECT_USUARIO} WHERE u.id = ? LIMIT 1`, [id]);
  const fila = filas[0];
  if (!fila) {
    throw new ErrorNoEncontrado('Usuario no encontrado');
  }
  return aUsuarioPublico(fila);
}

export async function registrarCliente(
  nombre: string,
  correo: string,
  password: string,
): Promise<UsuarioPublico> {
  const existentes = await query<RowDataPacket[]>(
    'SELECT id FROM usuario WHERE correo = ? LIMIT 1',
    [correo],
  );
  if (existentes.length > 0) {
    throw new ErrorConflicto('El correo ya está en uso');
  }
  const hash = await hashPassword(password);
  const rolId = await obtenerRolId('usuario');
  const resultado = await query<ResultSetHeader>(
    `INSERT INTO usuario (nombre, correo, password_hash, rol_id)
     VALUES (?, ?, ?, ?)`,
    [nombre, correo, hash, rolId],
  );
  return {
    id: resultado.insertId,
    nombre,
    correo,
    rol: 'usuario',
    activo: true,
  };
}
