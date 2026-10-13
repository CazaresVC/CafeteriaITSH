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

const CLIENTE = { id: 9, nombre: 'Alumno', correo: 'alumno@cafeitsh.local', activo: 1, rol: 'usuario' };

const tokenCliente = () => firmarToken({ sub: 9, rol: 'usuario' });
const COOKIE = (token: string) => [`token=${token}`];

const PEDIDO_PENDIENTE = {
  id: 7,
  usuarioId: 9,
  total: '60.00',
  estadoId: 1,
  estado: 'Pendiente',
};

const PEDIDO_PAGADO = {
  id: 7,
  usuarioId: 9,
  total: '60.00',
  estadoId: 2,
  estado: 'Pagado',
};

const HEADER_PAGADO = {
  id: 7,
  numero: 'ITS-20261013-0001',
  tipo: 'anticipado',
  estado: 'Pagado',
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

const PAGO_ROW = { id: 1, metodo: 'online', monto: '60.00', referencia: 'SIM-ABC123' };

let connExecute: Mock;

beforeEach(() => {
  queryMock.mockReset();
  conTransaccionMock.mockReset();
  connExecute = vi.fn(async (sql: string, parametros: unknown[]) => [await queryMock(sql, parametros)]);
  conTransaccionMock.mockImplementation(async (fn: (conn: unknown) => Promise<unknown>) =>
    fn({ execute: connExecute }),
  );
});

describe('US2 — pagar el pedido en línea', () => {
  it('aprueba el pago y avanza el pedido a Pagado (200)', async () => {
    queryMock
      .mockResolvedValueOnce([CLIENTE])
      .mockResolvedValueOnce([PEDIDO_PENDIENTE])
      .mockResolvedValueOnce([{ id: 2 }])
      .mockResolvedValueOnce([{ desde_id: 1 }])
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([HEADER_PAGADO])
      .mockResolvedValueOnce(DETALLES)
      .mockResolvedValueOnce([PAGO_ROW]);

    const res = await request(app)
      .post('/api/pedidos/7/pagar')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({ metodo: 'en_linea', tokenPago: 'tok-demo' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 7, estado: 'Pagado', total: 60 });
    expect(res.body.pago).toMatchObject({ metodo: 'online', monto: 60 });
    expect(conTransaccionMock).toHaveBeenCalledTimes(1);
  });

  it('rechaza el pago con 422 y deja el pedido en Pendiente', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]).mockResolvedValueOnce([PEDIDO_PENDIENTE]);

    const res = await request(app)
      .post('/api/pedidos/7/pagar')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({ metodo: 'en_linea', tokenPago: 'rechazar' });

    expect(res.status).toBe(422);
    expect(res.body.error.codigo).toBe('PAGO_RECHAZADO');
    expect(conTransaccionMock).not.toHaveBeenCalled();
  });

  it('es idempotente: reintentar un pedido ya Pagado no duplica el pago', async () => {
    queryMock
      .mockResolvedValueOnce([CLIENTE])
      .mockResolvedValueOnce([PEDIDO_PAGADO])
      .mockResolvedValueOnce([HEADER_PAGADO])
      .mockResolvedValueOnce(DETALLES)
      .mockResolvedValueOnce([PAGO_ROW]);

    const res = await request(app)
      .post('/api/pedidos/7/pagar')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({ metodo: 'en_linea' });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('Pagado');
    expect(conTransaccionMock).not.toHaveBeenCalled();
  });

  it('prohíbe pagar un pedido ajeno (403)', async () => {
    queryMock
      .mockResolvedValueOnce([CLIENTE])
      .mockResolvedValueOnce([{ ...PEDIDO_PENDIENTE, usuarioId: 99 }]);

    const res = await request(app)
      .post('/api/pedidos/7/pagar')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({ metodo: 'en_linea' });

    expect(res.status).toBe(403);
  });

  it('responde 409 si el pedido no está en un estado pagable', async () => {
    queryMock
      .mockResolvedValueOnce([CLIENTE])
      .mockResolvedValueOnce([{ ...PEDIDO_PENDIENTE, estadoId: 0, estado: 'Cancelado' }]);

    const res = await request(app)
      .post('/api/pedidos/7/pagar')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({ metodo: 'en_linea' });

    expect(res.status).toBe(409);
    expect(res.body.error.codigo).toBe('CONFLICTO');
  });

  it('rechaza un método de pago inválido con 400', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]);

    const res = await request(app)
      .post('/api/pedidos/7/pagar')
      .set('Cookie', COOKIE(tokenCliente()))
      .send({ metodo: 'efectivo' });

    expect(res.status).toBe(400);
  });
});
