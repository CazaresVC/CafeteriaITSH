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

const PLATILLO_ACTIVO = {
  id: 3,
  nombre: 'Gordita de frijol',
  categoria: 'Comida',
  descripcion: 'Con frijoles refritos',
  activo: 1,
};

const ITEM_DISPONIBLE = {
  id: 1,
  fecha: '2026-10-13',
  platilloId: 3,
  nombre: 'Gordita de frijol',
  categoria: 'Comida',
  descripcion: 'Con frijoles refritos',
  precio: '30.00',
  disponible: 1,
  especial: 0,
};

const ITEM_AGOTADO = {
  id: 2,
  fecha: '2026-10-13',
  platilloId: 5,
  nombre: 'Café de olla',
  categoria: 'Bebida',
  descripcion: null,
  precio: '20.00',
  disponible: 0,
  especial: 1,
};

const tokenAdmin = () => firmarToken({ sub: 1, rol: 'administrador' });
const tokenCliente = () => firmarToken({ sub: 9, rol: 'usuario' });
const COOKIE = (token: string) => [`token=${token}`];

beforeEach(() => {
  queryMock.mockReset();
});

describe('US1 — consulta del menú', () => {
  it('devuelve los ítems de la fecha con disponibilidad y especiales', async () => {
    queryMock
      .mockResolvedValueOnce([CLIENTE])
      .mockResolvedValueOnce([ITEM_DISPONIBLE, ITEM_AGOTADO]);

    const res = await request(app)
      .get('/api/menu?fecha=2026-10-13')
      .set('Cookie', COOKIE(tokenCliente()));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ id: 1, precio: 30, disponible: true });
    expect(res.body[1]).toMatchObject({ id: 2, precio: 20, disponible: false, especial: true });
  });

  it('rechaza una fecha con formato inválido (400)', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]);

    const res = await request(app)
      .get('/api/menu?fecha=13-10-2026')
      .set('Cookie', COOKIE(tokenCliente()));

    expect(res.status).toBe(400);
    expect(res.body.error.codigo).toBe('DATOS_INVALIDOS');
  });
});

describe('US7 — gestión del menú del día', () => {
  it('agrega un platillo al menú (201)', async () => {
    queryMock
      .mockResolvedValueOnce([ADMIN])
      .mockResolvedValueOnce([PLATILLO_ACTIVO])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ insertId: 10, affectedRows: 1 });

    const res = await request(app)
      .post('/api/menu')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ fecha: '2026-10-13', platilloId: 3, precio: 35.5 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 10, platilloId: 3, precio: 35.5, disponible: true });
  });

  it('rechaza un precio negativo (400)', async () => {
    queryMock.mockResolvedValueOnce([ADMIN]);

    const res = await request(app)
      .post('/api/menu')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ fecha: '2026-10-13', platilloId: 3, precio: -5 });

    expect(res.status).toBe(400);
  });

  it('rechaza un precio con más de 2 decimales (400)', async () => {
    queryMock.mockResolvedValueOnce([ADMIN]);

    const res = await request(app)
      .post('/api/menu')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ fecha: '2026-10-13', platilloId: 3, precio: 30.005 });

    expect(res.status).toBe(400);
  });

  it('rechaza duplicar (fecha, platillo_id) con 409', async () => {
    queryMock
      .mockResolvedValueOnce([ADMIN])
      .mockResolvedValueOnce([PLATILLO_ACTIVO])
      .mockResolvedValueOnce([{ id: 1 }]);

    const res = await request(app)
      .post('/api/menu')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ fecha: '2026-10-13', platilloId: 3, precio: 30 });

    expect(res.status).toBe(409);
    expect(res.body.error.codigo).toBe('CONFLICTO');
  });

  it('rechaza agregar un platillo inactivo (409)', async () => {
    queryMock
      .mockResolvedValueOnce([ADMIN])
      .mockResolvedValueOnce([{ ...PLATILLO_ACTIVO, activo: 0 }]);

    const res = await request(app)
      .post('/api/menu')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ fecha: '2026-10-13', platilloId: 3, precio: 30 });

    expect(res.status).toBe(409);
  });

  it('responde 404 al agregar un platillo inexistente', async () => {
    queryMock.mockResolvedValueOnce([ADMIN]).mockResolvedValueOnce([]);

    const res = await request(app)
      .post('/api/menu')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ fecha: '2026-10-13', platilloId: 999, precio: 30 });

    expect(res.status).toBe(404);
  });

  it('actualiza precio y disponibilidad de un ítem (200)', async () => {
    queryMock
      .mockResolvedValueOnce([ADMIN])
      .mockResolvedValueOnce([ITEM_DISPONIBLE])
      .mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .patch('/api/menu/1')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ precio: 40, disponible: false });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, precio: 40, disponible: false });
  });

  it('quita un ítem del menú (204)', async () => {
    queryMock
      .mockResolvedValueOnce([ADMIN])
      .mockResolvedValueOnce([ITEM_DISPONIBLE])
      .mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .delete('/api/menu/1')
      .set('Cookie', COOKIE(tokenAdmin()));

    expect(res.status).toBe(204);
  });

  it('prohíbe gestionar el menú a un rol no administrador (403)', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]);

    const res = await request(app)
      .post('/api/menu')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({ fecha: '2026-10-13', platilloId: 3, precio: 30 });

    expect(res.status).toBe(403);
  });
});

describe('US7 — republicar el menú del día', () => {
  it('copia el menú más reciente al destino omitiendo duplicados (200)', async () => {
    queryMock
      .mockResolvedValueOnce([ADMIN])
      .mockResolvedValueOnce([{ origen: '2026-10-13' }])
      .mockResolvedValueOnce([{ total: 3 }])
      .mockResolvedValueOnce({ affectedRows: 2 });

    const res = await request(app)
      .post('/api/menu/republicar')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ fecha: '2026-10-14' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      fecha: '2026-10-14',
      origen: '2026-10-13',
      agregados: 2,
      omitidos: 1,
    });
  });

  it('usa la fecha de hoy cuando no se envía destino', async () => {
    queryMock
      .mockResolvedValueOnce([ADMIN])
      .mockResolvedValueOnce([{ origen: '2026-10-13' }])
      .mockResolvedValueOnce([{ total: 3 }])
      .mockResolvedValueOnce({ affectedRows: 3 });

    const res = await request(app)
      .post('/api/menu/republicar')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.origen).toBe('2026-10-13');
    expect(res.body.agregados).toBe(3);
    expect(res.body.omitidos).toBe(0);
  });

  it('responde 404 cuando no hay un menú previo', async () => {
    queryMock.mockResolvedValueOnce([ADMIN]).mockResolvedValueOnce([{ origen: null }]);

    const res = await request(app)
      .post('/api/menu/republicar')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ fecha: '2026-10-14' });

    expect(res.status).toBe(404);
  });

  it('rechaza una fecha inválida (400)', async () => {
    queryMock.mockResolvedValueOnce([ADMIN]);

    const res = await request(app)
      .post('/api/menu/republicar')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ fecha: '14-10-2026' });

    expect(res.status).toBe(400);
    expect(res.body.error.codigo).toBe('DATOS_INVALIDOS');
  });

  it('prohíbe republicar a un rol no administrador (403)', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]);

    const res = await request(app)
      .post('/api/menu/republicar')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({ fecha: '2026-10-14' });

    expect(res.status).toBe(403);
  });
});
