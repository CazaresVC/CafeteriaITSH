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
const CLIENTE = { id: 9, nombre: 'Alumno', correo: 'alumno@cafeitsh.local', activo: 1, rol: 'usuario' };

const PLATILLO = {
  id: 1,
  nombre: 'Gordita de chicharrón',
  categoria: 'Comida',
  descripcion: null,
  activo: 1,
};

const tokenAdmin = () => firmarToken({ sub: 1, rol: 'administrador' });
const tokenCliente = () => firmarToken({ sub: 9, rol: 'usuario' });
const COOKIE = (token: string) => [`token=${token}`];

beforeEach(() => {
  queryMock.mockReset();
});

describe('US7 — gestión del catálogo de platillos', () => {
  it('lista el catálogo para un usuario autenticado', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]).mockResolvedValueOnce([PLATILLO]);

    const res = await request(app).get('/api/platillos').set('Cookie', COOKIE(tokenCliente()));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ id: 1, nombre: 'Gordita de chicharrón', activo: true });
  });

  it('crea un platillo (administrador) devolviendo 201', async () => {
    queryMock
      .mockResolvedValueOnce([ADMIN])
      .mockResolvedValueOnce({ insertId: 3, affectedRows: 1 });

    const res = await request(app)
      .post('/api/platillos')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ nombre: 'Torta de jamón', categoria: 'Comida' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 3, nombre: 'Torta de jamón', activo: true });
  });

  it('rechaza un nombre vacío (400)', async () => {
    queryMock.mockResolvedValueOnce([ADMIN]);

    const res = await request(app)
      .post('/api/platillos')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ nombre: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error.codigo).toBe('DATOS_INVALIDOS');
  });

  it('prohíbe gestionar a un rol no administrador (403)', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]);

    const res = await request(app)
      .post('/api/platillos')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({ nombre: 'Intruso' });

    expect(res.status).toBe(403);
    expect(res.body.error.codigo).toBe('PROHIBIDO');
  });

  it('edita un platillo existente (200)', async () => {
    queryMock
      .mockResolvedValueOnce([ADMIN])
      .mockResolvedValueOnce([PLATILLO])
      .mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .patch('/api/platillos/1')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ categoria: 'Antojitos' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, categoria: 'Antojitos' });
  });

  it('desactiva un platillo (baja lógica, 204)', async () => {
    queryMock
      .mockResolvedValueOnce([ADMIN])
      .mockResolvedValueOnce([PLATILLO])
      .mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .delete('/api/platillos/1')
      .set('Cookie', COOKIE(tokenAdmin()));

    expect(res.status).toBe(204);
  });

  it('responde 404 al editar un platillo inexistente', async () => {
    queryMock.mockResolvedValueOnce([ADMIN]).mockResolvedValueOnce([]);

    const res = await request(app)
      .patch('/api/platillos/999')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ nombre: 'Fantasma' });

    expect(res.status).toBe(404);
  });

  it('exige sesión (401 sin cookie)', async () => {
    const res = await request(app).get('/api/platillos');
    expect(res.status).toBe(401);
  });
});
