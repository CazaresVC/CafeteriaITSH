import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import request from 'supertest';

vi.mock('../src/config/db', () => ({
  query: vi.fn(),
  pool: {},
  cerrarPool: vi.fn(),
  conTransaccion: vi.fn(),
}));

import app from '../src/app';
import { conTransaccion, query } from '../src/config/db';
import { firmarToken } from '../src/utils/jwt';

const queryMock = query as unknown as Mock;
const conTransaccionMock = conTransaccion as unknown as Mock;

const CAJERO = { id: 2, nombre: 'Cajero', correo: 'cajero@cafeitsh.local', activo: 1, rol: 'cajero' };
const ADMIN = { id: 1, nombre: 'Admin', correo: 'admin@cafeitsh.local', activo: 1, rol: 'administrador' };

const tokenCajero = () => firmarToken({ sub: 2, rol: 'cajero' });
const tokenAdmin = () => firmarToken({ sub: 1, rol: 'administrador' });
const COOKIE = (token: string) => [`token=${token}`];

const GORDITA = { menuDiaId: 1, platilloId: 3, nombre: 'Gordita de frijol', precio: '30.00' };
const CAFE = { menuDiaId: 2, platilloId: 5, nombre: 'Café de olla', precio: '20.00' };
const ESTADO_PENDIENTE = { id: 1 };
const ESTADO_PAGADO = { id: 2 };

const PEDIDO_MOSTRADOR_PENDIENTE = {
  id: 7,
  usuarioId: null,
  total: '60.00',
  estadoId: 1,
  estado: 'Pendiente',
};

const HEADER_PAGADO = {
  id: 7,
  numero: 'ITS-20261013-0007',
  tipo: 'mostrador',
  estado: 'Pagado',
  total: '60.00',
  usuarioId: null,
  clienteNombre: 'Juan',
  fechaRecoleccion: null,
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

const PAGO_EFECTIVO = { id: 1, metodo: 'efectivo', monto: '60.00', referencia: null };
const HISTORIAL = [
  {
    estadoAnterior: 'Pendiente',
    estadoNuevo: 'Pagado',
    cambiadoPor: 2,
    fecha: '2026-10-13 10:05:00',
  },
];

let connExecute: Mock;

beforeEach(() => {
  queryMock.mockReset();
  conTransaccionMock.mockReset();
  connExecute = vi.fn(async (sql: string, parametros: unknown[]) => [await queryMock(sql, parametros)]);
  conTransaccionMock.mockImplementation(async (fn: (conn: unknown) => Promise<unknown>) =>
    fn({ execute: connExecute }),
  );
});

describe('US1 — registrar un pedido de mostrador', () => {
  it('crea un pedido Pendiente de tipo mostrador con total del servidor (201)', async () => {
    queryMock
      .mockResolvedValueOnce([CAJERO])
      .mockResolvedValueOnce([GORDITA])
      .mockResolvedValueOnce([ESTADO_PENDIENTE])
      .mockResolvedValueOnce({ insertId: 7, affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .post('/api/pedidos/mostrador')
      .set('Cookie', COOKIE(tokenCajero()))
      .send({ cliente_nombre: 'Juan', items: [{ menu_dia_id: 1, cantidad: 2 }] });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 7,
      tipo: 'mostrador',
      estado: 'Pendiente',
      total: 60,
      clienteNombre: 'Juan',
    });
    expect(res.body.numero).toMatch(/^ITS-\d{8}-\d{4}$/);
    expect(res.body.lineas[0]).toMatchObject({ platilloId: 3, cantidad: 2, subtotal: 60 });
    expect(conTransaccionMock).toHaveBeenCalledTimes(1);
  });

  it('calcula el total sumando las líneas en el servidor', async () => {
    queryMock
      .mockResolvedValueOnce([CAJERO])
      .mockResolvedValueOnce([GORDITA])
      .mockResolvedValueOnce([CAFE])
      .mockResolvedValueOnce([ESTADO_PENDIENTE])
      .mockResolvedValueOnce({ insertId: 8, affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .post('/api/pedidos/mostrador')
      .set('Cookie', COOKIE(tokenCajero()))
      .send({
        items: [
          { menu_dia_id: 1, cantidad: 1 },
          { menu_dia_id: 2, cantidad: 2 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(70);
    expect(res.body.lineas).toHaveLength(2);
  });

  it('rechaza un platillo no disponible con 422', async () => {
    queryMock.mockResolvedValueOnce([CAJERO]).mockResolvedValueOnce([]);

    const res = await request(app)
      .post('/api/pedidos/mostrador')
      .set('Cookie', COOKIE(tokenCajero()))
      .send({ items: [{ menu_dia_id: 999, cantidad: 1 }] });

    expect(res.status).toBe(422);
    expect(res.body.error.codigo).toBe('PLATILLO_NO_DISPONIBLE');
    expect(conTransaccionMock).not.toHaveBeenCalled();
  });

  it('rechaza un pedido sin items con 400', async () => {
    queryMock.mockResolvedValueOnce([CAJERO]);

    const res = await request(app)
      .post('/api/pedidos/mostrador')
      .set('Cookie', COOKIE(tokenCajero()))
      .send({ items: [] });

    expect(res.status).toBe(400);
  });

  it('prohíbe registrar mostrador a un rol distinto de cajero (403)', async () => {
    queryMock.mockResolvedValueOnce([ADMIN]);

    const res = await request(app)
      .post('/api/pedidos/mostrador')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ items: [{ menu_dia_id: 1, cantidad: 1 }] });

    expect(res.status).toBe(403);
  });
});

describe('US1 — cobrar el pedido en efectivo', () => {
  it('registra el pago efectivo y avanza el pedido a Pagado (200)', async () => {
    queryMock
      .mockResolvedValueOnce([CAJERO])
      .mockResolvedValueOnce([ESTADO_PAGADO])
      .mockResolvedValueOnce([PEDIDO_MOSTRADOR_PENDIENTE])
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([{ desde_id: 1 }])
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([HEADER_PAGADO])
      .mockResolvedValueOnce(DETALLES)
      .mockResolvedValueOnce([PAGO_EFECTIVO])
      .mockResolvedValueOnce(HISTORIAL);

    const res = await request(app)
      .post('/api/pedidos/7/cobro')
      .set('Cookie', COOKIE(tokenCajero()))
      .send({ metodo: 'efectivo' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 7, estado: 'Pagado', tipo: 'mostrador' });
    expect(res.body.pago).toMatchObject({ metodo: 'efectivo', monto: 60 });
    expect(conTransaccionMock).toHaveBeenCalledTimes(1);
  });

  it('responde 409 si el pedido ya no está pendiente', async () => {
    queryMock
      .mockResolvedValueOnce([CAJERO])
      .mockResolvedValueOnce([ESTADO_PAGADO])
      .mockResolvedValueOnce([{ ...PEDIDO_MOSTRADOR_PENDIENTE, estadoId: 2, estado: 'Pagado' }]);

    const res = await request(app)
      .post('/api/pedidos/7/cobro')
      .set('Cookie', COOKIE(tokenCajero()))
      .send({ metodo: 'efectivo' });

    expect(res.status).toBe(409);
    expect(res.body.error.codigo).toBe('CONFLICTO');
  });

  it('rechaza un método distinto de efectivo con 400', async () => {
    queryMock.mockResolvedValueOnce([CAJERO]);

    const res = await request(app)
      .post('/api/pedidos/7/cobro')
      .set('Cookie', COOKIE(tokenCajero()))
      .send({ metodo: 'online' });

    expect(res.status).toBe(400);
  });

  it('prohíbe cobrar a un rol distinto de cajero (403)', async () => {
    queryMock.mockResolvedValueOnce([ADMIN]);

    const res = await request(app)
      .post('/api/pedidos/7/cobro')
      .set('Cookie', COOKIE(tokenAdmin()))
      .send({ metodo: 'efectivo' });

    expect(res.status).toBe(403);
  });
});
