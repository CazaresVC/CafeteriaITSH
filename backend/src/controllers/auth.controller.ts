import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { autenticar, registrarCliente } from '../services/auth.service';
import { firmarToken } from '../utils/jwt';
import { esProduccion } from '../config/env';
import type { LoginInput, RegistroInput } from '../utils/schemas';

const COOKIE_SESION = 'token';
const DOS_HORAS_MS = 2 * 60 * 60 * 1000;

function opcionesCookie(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: esProduccion,
    path: '/',
    maxAge,
  };
}

export const login: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { correo, password } = req.body as LoginInput;
    const usuario = await autenticar(correo, password);
    const token = firmarToken({ sub: usuario.id, rol: usuario.rol });
    res.cookie(COOKIE_SESION, token, opcionesCookie(DOS_HORAS_MS));
    res.status(200).json(usuario);
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie(COOKIE_SESION, {
    httpOnly: true,
    sameSite: 'lax',
    secure: esProduccion,
    path: '/',
  });
  res.status(204).end();
};

export const me: RequestHandler = (req, res) => {
  res.status(200).json(req.usuario);
};

export const registro: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { nombre, correo, password } = req.body as RegistroInput;
    const usuario = await registrarCliente(nombre, correo, password);
    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
};
