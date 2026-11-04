import type { Express } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import request from 'supertest';
import { query } from '../../src/config/db';
import { hashPassword } from '../../src/utils/password';

export const PASSWORD = 'Qa12345678';

export type RolPrueba = 'administrador' | 'cajero' | 'cocinero' | 'usuario';

export function correoUnico(prefijo: string): string {
  return `qa-${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@cafeitsh.test`;
}

export async function crearUsuario(rol: RolPrueba): Promise<{
  id: number;
  correo: string;
  password: string;
  rol: RolPrueba;
}> {
  const correo = correoUnico(rol);
  const hash = await hashPassword(PASSWORD);
  const roles = await query<RowDataPacket[]>('SELECT id FROM rol WHERE nombre = ? LIMIT 1', [rol]);
  const rolId = roles[0]?.id;
  if (typeof rolId !== 'number') {
    throw new Error(`Rol no encontrado en la base de pruebas: ${rol}`);
  }

  const resultado = await query<ResultSetHeader>(
    'INSERT INTO usuario (nombre, correo, password_hash, rol_id) VALUES (?, ?, ?, ?)',
    [`QA ${rol}`, correo, hash, rolId],
  );

  return { id: resultado.insertId, correo, password: PASSWORD, rol };
}

export async function iniciarSesion(
  app: Express,
  correo: string,
  password: string = PASSWORD,
): Promise<string> {
  const respuesta = await request(app).post('/api/auth/login').send({ correo, password });
  if (respuesta.status !== 200) {
    throw new Error(
      `No se pudo iniciar sesión (${respuesta.status}): ${JSON.stringify(respuesta.body)}`,
    );
  }

  const setCookie = respuesta.headers['set-cookie'];
  const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  const cookie = cookies.find((valor) => valor.startsWith('token='));
  if (!cookie) {
    throw new Error('El login no emitió la cookie de sesión');
  }
  return cookie.split(';')[0];
}

export async function crearMenuHoy(precio = 12.5): Promise<{
  platilloId: number;
  menuDiaId: number;
  precio: number;
}> {
  const sufijo = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const platillo = await query<ResultSetHeader>(
    'INSERT INTO platillo (nombre, categoria, descripcion, activo) VALUES (?, ?, ?, 1)',
    [`QA Platillo ${sufijo}`, 'QA', 'Platillo creado por la suite de integración'],
  );

  const menu = await query<ResultSetHeader>(
    `INSERT INTO menu_dia (fecha, platillo_id, precio, disponible, especial)
     VALUES (CURDATE(), ?, ?, 1, 0)`,
    [platillo.insertId, precio],
  );

  return { platilloId: platillo.insertId, menuDiaId: menu.insertId, precio };
}

export async function fechaHoyDb(): Promise<string> {
  const filas = await query<RowDataPacket[]>('SELECT CURDATE() AS hoy');
  return String(filas[0]?.hoy);
}

export async function limpiarDatos(): Promise<void> {
  await query('DELETE FROM notificacion');
  await query('DELETE FROM pago');
  await query('DELETE FROM pedido_estado_historial');
  await query('DELETE FROM pedido_detalle');
  await query('DELETE FROM pedido');
  await query('DELETE FROM menu_dia');
  await query("DELETE FROM platillo WHERE nombre LIKE 'QA %'");
  await query("DELETE FROM usuario WHERE correo LIKE 'qa-%@cafeitsh.test'");
}
