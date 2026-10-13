import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ErrorNoAutorizado } from './errors';
import { esRolValido, type RolNombre } from './roles';

export interface TokenPayload {
  sub: number;
  rol: RolNombre;
}

export function firmarToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verificarToken(token: string): TokenPayload {
  try {
    const decodificado = jwt.verify(token, env.jwtSecret);
    if (typeof decodificado !== 'object' || decodificado === null) {
      throw new Error('payload inválido');
    }
    const { sub, rol } = decodificado as jwt.JwtPayload;
    const id = Number(sub);
    if (!Number.isInteger(id) || id <= 0 || typeof rol !== 'string' || !esRolValido(rol)) {
      throw new Error('payload inválido');
    }
    return { sub: id, rol };
  } catch {
    throw new ErrorNoAutorizado();
  }
}
