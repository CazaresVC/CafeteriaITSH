import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export function hashPassword(plano: string): Promise<string> {
  return bcrypt.hash(plano, env.bcryptCost);
}

export function verificarPassword(plano: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plano, hash);
}
