import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import request from 'supertest';

vi.mock('../src/config/db', () => ({
  query: vi.fn(),
  pool: {},
  cerrarPool: vi.fn(),
  conTransaccion: vi.fn(),
}));

vi.mock('../src/services/ventana.service', () => ({
  dentroDeVentana: vi.fn(),
  fechaRecoleccion: vi.fn(),
}));

import app from '../src/app';
import { conTransaccion, query } from '../src/config/db';
import { dentroDeVentana, fechaRecoleccion } from '../src/services/ventana.service';
import { firmarToken } from '../src/utils/jwt';

const queryMock = query as unknown as Mock;
const conTransaccionMock = conTransaccion as unknown as Mock;
const ventanaMock = dentroDeVentana as unknown as Mock;
const recoleccionMock = fechaRecoleccion as unknown as Mock;

const CLIENTE = { id: 9, nombre: 'Alumno', correo: 'alumno@cafeitsh.local', activo: 1, rol: 'usuario' };
const ADMIN = { id: 1, nombre: 'Admin', correo: 'admin@cafeitsh.local', activo: 1, rol: 'administrador' };

const tokenCliente = () => firmarToken({ sub: 9, rol: 'usuario' });
const tokenAdmin = () => firmarToken({ sub: 1, rol: 'administrador' });
const COOKIE = (token: string) => [`token=${token}`];

const GORDITA = { menuDiaId: 1, platilloId: 3, nombre: 'Gordita de frijol', precio: '30.00' };
const CAFE = { menuDiaId: 2, platilloId: 5, nombre: 'Café de olla', precio: '20.00' };
const ESTADO_PENDIENTE = { id: 1 };

const PEDIDO_HEADER = {
  id: 7,
  numero: 'ITS-20261013-0001',
  tipo: 'anticipado',
  estado: 'Pendiente',
  total: '60.00',
  usuarioId: 9,
  creadoEn: '2026-10-13 10:00:00',
};

const DETALLES = [
  {
    id: 1,
    platilloId: 3,
    nombre: 'Gordita de frijol',
    cantidad: 2,
    precioUnitario: '30.00',
    subtotal: '60.00',
  },
];

let connExecute: Mock;

beforeEach(() => {
  queryMock.mockReset();
  conTransaccionMock.mockReset();
  ventanaMock.mockReset();
  recoleccionMock.mockReset();
  ventanaMock.mockReturnValue(true);
  recoleccionMock.mockReturnValue(new Date('2026-10-13T11:00:00'));
  connExecute = vi.fn(async (sql: string, parametros: unknown[]) => [await queryMock(sql, parametros)]);
  conTransaccionMock.mockImplementation(async (fn: (conn: unknown) => Promise<unknown>) =>
    fn({ execute: connExecute }),
  );
});

describe('US1 — crear un pedido anticipado', () => {
  it('crea un pedido Pendiente con folio y total correctos (201)', async () => {
    queryMock
      .mockResolvedValueOnce([CLIENTE])
      .mockResolvedValueOnce([GORDITA])
      .mockResolvedValueOnce([ESTADO_PENDIENTE])
      .mockResolvedValueOnce({ insertId: 7, affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .post('/api/pedidos')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({ lineas: [{ platilloId: 3, cantidad: 2 }] });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 7, tipo: 'anticipado', estado: 'Pendiente', total: 60 });
    expect(res.body.numero).toMatch(/^ITS-\d{8}-\d{4}$/);
    expect(res.body.lineas[0]).toMatchObject({
      platilloId: 3,
      cantidad: 2,
      precioUnitario: 30,
      subtotal: 60,
    });
    expect(conTransaccionMock).toHaveBeenCalledTimes(1);
  });

  it('calcula el total sumando las líneas', async () => {
    queryMock
      .mockResolvedValueOnce([CLIENTE])
      .mockResolvedValueOnce([GORDITA])
      .mockResolvedValueOnce([CAFE])
      .mockResolvedValueOnce([ESTADO_PENDIENTE])
      .mockResolvedValueOnce({ insertId: 8, affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .post('/api/pedidos')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({
        lineas: [
          { platilloId: 3, cantidad: 1 },
          { platilloId: 5, cantidad: 2 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(70);
    expect(res.body.lineas).toHaveLength(2);
  });

  it('rechaza fuera de la ventana con 422', async () => {
    ventanaMock.mockReturnValue(false);
    queryMock.mockResolvedValueOnce([CLIENTE]);

    const res = await request(app)
      .post('/api/pedidos')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({ lineas: [{ platilloId: 3, cantidad: 1 }] });

    expect(res.status).toBe(422);
    expect(res.body.error.codigo).toBe('FUERA_DE_VENTANA');
    expect(conTransaccionMock).not.toHaveBeenCalled();
  });

  it('rechaza un platillo no disponible en el menú de hoy con 422', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]).mockResolvedValueOnce([]);

    const res = await request(app)
      .post('/api/pedidos')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({ lineas: [{ platilloId: 999, cantidad: 1 }] });

    expect(res.status).toBe(422);
    expect(res.body.error.codigo).toBe('PLATILLO_NO_DISPONIBLE');
  });

  it('rechaza una línea sin cantidad válida con 400', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]);

    const res = await request(app)
      .post('/api/pedidos')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({ lineas: [{ platilloId: 3, cantidad: 0 }] });

    expect(res.status).toBe(400);
    expect(res.body.error.codigo).toBe('DATOS_INVALIDOS');
  });

  it('rechaza un pedido sin líneas con 400', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]);

    const res = await request(app)
      .post('/api/pedidos')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({ lineas: [] });

    expect(res.status).toBe(400);
  });

  it('prohíbe crear pedidos a un rol distinto de usuario (403)', async () => {
    queryMock.mockResolvedValueOnce([ADMIN]);

    const res = await request(app)
      .post('/api/pedidos')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ lineas: [{ platilloId: 3, cantidad: 1 }] });

    expect(res.status).toBe(403);
  });

  it('consulta el propio pedido con sus líneas (200)', async () => {
    queryMock
      .mockResolvedValueOnce([CLIENTE])
      .mockResolvedValueOnce([PEDIDO_HEADER])
      .mockResolvedValueOnce(DETALLES)
      .mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/pedidos/7')
      .set('Cookie', COOKIE(tokenCliente()));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 7, total: 60, estado: 'Pendiente' });
    expect(res.body.lineas[0]).toMatchObject({ platilloId: 3, subtotal: 60 });
    expect(res.body.pago).toBeNull();
  });

  it('responde 404 al consultar un pedido ajeno (no revela su existencia)', async () => {
    queryMock
      .mockResolvedValueOnce([CLIENTE])
      .mockResolvedValueOnce([{ ...PEDIDO_HEADER, usuarioId: 99 }]);

    const res = await request(app)
      .get('/api/pedidos/7')
      .set('Cookie', COOKIE(tokenCliente()));

    expect(res.status).toBe(404);
    expect(res.body.error.codigo).toBe('NO_ENCONTRADO');
  });

  it('responde 404 al consultar un pedido inexistente', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]).mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/pedidos/123')
      .set('Cookie', COOKIE(tokenCliente()));

    expect(res.status).toBe(404);
  });
});
