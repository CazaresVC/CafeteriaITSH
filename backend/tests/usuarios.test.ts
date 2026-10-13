import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import request from 'supertest';

vi.mock('../src/config/db', () => ({
  query: vi.fn(),
  pool: {},
  cerrarPool: vi.fn(),
}));

import app from '../src/app';
import { query } from '../src/config/db';
import { firmarToken } from '../src/utils/jwt';

const queryMock = query as unknown as Mock;

const ADMIN = { id: 1, nombre: 'Admin', correo: 'admin@cafeitsh.local', activo: 1, rol: 'administrador' };
const CAJERO = { id: 2, nombre: 'Cajero', correo: 'caja@cafeitsh.local', activo: 1, rol: 'cajero' };
const CLIENTE = { id: 9, nombre: 'Alumno', correo: 'alumno@cafeitsh.local', activo: 1, rol: 'usuario' };

const tokenAdmin = () => firmarToken({ sub: 1, rol: 'administrador' });
const tokenCliente = () => firmarToken({ sub: 9, rol: 'usuario' });
const COOKIE = (token: string) => [`token=${token}`];

beforeEach(() => {
  queryMock.mockReset();
});

describe('US3 — administración de usuarios operativos', () => {
  it('lista operativos para el administrador', async () => {
    queryMock.mockResolvedValueOnce([ADMIN]).mockResolvedValueOnce([CAJERO]);

    const res = await request(app)
      .get('/api/usuarios')
      .set('Cookie', COOKIE(tokenAdmin()));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ id: 2, rol: 'cajero' });
  });

  it('deniega el acceso a un cliente (403)', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]);

    const res = await request(app)
      .get('/api/usuarios')
      .set('Cookie', COOKIE(tokenCliente()));

    expect(res.status).toBe(403);
    expect(res.body.error.codigo).toBe('PROHIBIDO');
  });

  it('exige sesión (401 sin cookie)', async () => {
    const res = await request(app).get('/api/usuarios');
    expect(res.status).toBe(401);
  });

  it('crea un cajero', async () => {
    queryMock
      .mockResolvedValueOnce([ADMIN])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 2 }])
      .mockResolvedValueOnce({ insertId: 5, affectedRows: 1 });

    const res = await request(app)
      .post('/api/usuarios')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({
        nombre: 'Nuevo Cajero',
        correo: 'nuevo.cajero@cafeitsh.local',
        password: 'Password1',
        rol: 'cajero',
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 5, rol: 'cajero' });
  });

  it('rechaza correo duplicado al crear (409)', async () => {
    queryMock.mockResolvedValueOnce([ADMIN]).mockResolvedValueOnce([{ id: 2 }]);

    const res = await request(app)
      .post('/api/usuarios')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({
        nombre: 'Duplicado',
        correo: 'caja@cafeitsh.local',
        password: 'Password1',
        rol: 'cajero',
      });

    expect(res.status).toBe(409);
  });

  it('rechaza crear un rol no operativo (400)', async () => {
    queryMock.mockResolvedValueOnce([ADMIN]);

    const res = await request(app)
      .post('/api/usuarios')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({
        nombre: 'Admin 2',
        correo: 'otro.admin@cafeitsh.local',
        password: 'Password1',
        rol: 'administrador',
      });

    expect(res.status).toBe(400);
  });

  it('deshabilita un operativo (204)', async () => {
    queryMock
      .mockResolvedValueOnce([ADMIN])
      .mockResolvedValueOnce([CAJERO])
      .mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .delete('/api/usuarios/2')
      .set('Cookie', COOKIE(tokenAdmin()));

    expect(res.status).toBe(204);
  });

  it('responde 404 al deshabilitar un operativo inexistente', async () => {
    queryMock.mockResolvedValueOnce([ADMIN]).mockResolvedValueOnce([]);

    const res = await request(app)
      .delete('/api/usuarios/999')
      .set('Cookie', COOKIE(tokenAdmin()));

    expect(res.status).toBe(404);
  });
});
