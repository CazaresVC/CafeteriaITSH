import type { Request, Response, NextFunction } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import { query } from '../config/db';
import { ErrorNoAutorizado } from '../utils/errors';
import { verificarToken } from '../utils/jwt';
import { esRolValido } from '../utils/roles';
import type { UsuarioAutenticado } from '../tipos';

interface FilaUsuario extends RowDataPacket {
  id: number;
  nombre: string;
  correo: string;
  activo: number;
  rol: string;
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.token;
    if (!token) {
      throw new ErrorNoAutorizado();
    }
    const payload = verificarToken(token);
    const filas = await query<FilaUsuario[]>(
      `SELECT u.id, u.nombre, u.correo, u.activo, r.nombre AS rol
         FROM usuario u
         JOIN rol r ON r.id = u.rol_id
        WHERE u.id = ?
        LIMIT 1`,
      [payload.sub],
    );
    const fila = filas[0];
    if (!fila || !fila.activo || !esRolValido(fila.rol)) {
      throw new ErrorNoAutorizado();
    }
    const usuario: UsuarioAutenticado = {
      id: fila.id,
      nombre: fila.nombre,
      correo: fila.correo,
      rol: fila.rol,
      activo: Boolean(fila.activo),
    };
    req.usuario = usuario;
    next();
  } catch (error) {
    next(error);
  }
}
