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

const COCINERO = { id: 3, nombre: 'Cocinero', correo: 'cocinero@cafeitsh.local', activo: 1, rol: 'cocinero' };
const CLIENTE = { id: 9, nombre: 'Alumno', correo: 'alumno@cafeitsh.local', activo: 1, rol: 'usuario' };

const tokenCocinero = () => firmarToken({ sub: 3, rol: 'cocinero' });
const tokenCliente = () => firmarToken({ sub: 9, rol: 'usuario' });
const COOKIE = (token: string) => [`token=${token}`];

const HEADER_MOSTRADOR = {
  id: 7,
  numero: 'ITS-20261013-0007',
  tipo: 'mostrador',
  estado: 'Pendiente',
  total: '60.00',
  usuarioId: null,
  clienteNombre: 'Juan',
  fechaRecoleccion: null,
  creadoEn: '2026-10-13 10:00:00',
};

const HEADER_ANTICIPADO = {
  id: 8,
  numero: 'ITS-20261013-0008',
  tipo: 'anticipado',
  estado: 'Pendiente',
  total: '30.00',
  usuarioId: 9,
  clienteNombre: null,
  fechaRecoleccion: '2026-10-13 11:00:00',
  creadoEn: '2026-10-13 10:01:00',
};

const DETALLE_7 = {
  pedidoId: 7,
  id: 1,
  platilloId: 3,
  nombre: 'Gordita de frijol',
  cantidad: 2,
  precioUnitario: '30.00',
  subtotal: '60.00',
};

const DETALLE_8 = {
  pedidoId: 8,
  id: 2,
  platilloId: 5,
  nombre: 'Café de olla',
  cantidad: 1,
  precioUnitario: '30.00',
  subtotal: '30.00',
};

const HEADER_EN_PREPARACION = { ...HEADER_MOSTRADOR, estado: 'En preparación' };
const PAGO_EFECTIVO = { id: 1, metodo: 'efectivo', monto: '60.00', referencia: null };
const HISTORIAL = [
  {
    estadoAnterior: 'Pendiente',
    estadoNuevo: 'Pagado',
    cambiadoPor: 2,
    fecha: '2026-10-13 10:05:00',
  },
  {
    estadoAnterior: 'Pagado',
    estadoNuevo: 'En preparación',
    cambiadoPor: 3,
    fecha: '2026-10-13 10:06:00',
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

describe('US2 — tablero de cocina (KDS)', () => {
  it('lista los pedidos entrantes con sus líneas, ordenados por llegada (200)', async () => {
    queryMock
      .mockResolvedValueOnce([COCINERO])
      .mockResolvedValueOnce([HEADER_MOSTRADOR, HEADER_ANTICIPADO])
      .mockResolvedValueOnce([DETALLE_7, DETALLE_8]);

    const res = await request(app)
      .get('/api/pedidos?estado=Pendiente')
      .set('Cookie', COOKIE(tokenCocinero()));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ id: 7, tipo: 'mostrador', estado: 'Pendiente' });
    expect(res.body[0].lineas[0]).toMatchObject({ platilloId: 3, cantidad: 2 });
    expect(res.body[1]).toMatchObject({ id: 8, tipo: 'anticipado' });
  });

  it('acepta varios estados y filtro por origen', async () => {
    queryMock.mockResolvedValueOnce([COCINERO]).mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/pedidos?estado=Pagado&estado=En%20preparaci%C3%B3n&origen=mostrador')
      .set('Cookie', COOKIE(tokenCocinero()));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('prohíbe listar pedidos a un cliente (403)', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]);

    const res = await request(app)
      .get('/api/pedidos')
      .set('Cookie', COOKIE(tokenCliente()));

    expect(res.status).toBe(403);
  });

  it('muestra el detalle con historial al personal (200)', async () => {
    queryMock
      .mockResolvedValueOnce([COCINERO])
      .mockResolvedValueOnce([HEADER_EN_PREPARACION])
      .mockResolvedValueOnce([DETALLE_7])
      .mockResolvedValueOnce([PAGO_EFECTIVO])
      .mockResolvedValueOnce(HISTORIAL);

    const res = await request(app)
      .get('/api/pedidos/7')
      .set('Cookie', COOKIE(tokenCocinero()));

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('En preparación');
    expect(res.body.historial).toHaveLength(2);
    expect(res.body.historial[1]).toMatchObject({
      estadoAnterior: 'Pagado',
      estadoNuevo: 'En preparación',
    });
  });
});

describe('US2 — avanzar el estado de un pedido', () => {
  it('avanza Pagado → En preparación y audita el cambio (200)', async () => {
    queryMock
      .mockResolvedValueOnce([COCINERO])
      .mockResolvedValueOnce([{ id: 3 }])
      .mockResolvedValueOnce([{ id: 7, estadoId: 2 }])
      .mockResolvedValueOnce([{ desde_id: 2 }])
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([HEADER_EN_PREPARACION])
      .mockResolvedValueOnce([DETALLE_7])
      .mockResolvedValueOnce([PAGO_EFECTIVO])
      .mockResolvedValueOnce(HISTORIAL);

    const res = await request(app)
      .patch('/api/pedidos/7/estado')
      .set('Cookie', COOKIE(tokenCocinero()))
      .send({ estado: 'En preparación' });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('En preparación');
    expect(conTransaccionMock).toHaveBeenCalledTimes(1);
  });

  it('rechaza una transición no permitida con 409', async () => {
    queryMock
      .mockResolvedValueOnce([COCINERO])
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([{ id: 7, estadoId: 5 }])
      .mockResolvedValueOnce([]);

    const res = await request(app)
      .patch('/api/pedidos/7/estado')
      .set('Cookie', COOKIE(tokenCocinero()))
      .send({ estado: 'Pendiente' });

    expect(res.status).toBe(409);
    expect(res.body.error.codigo).toBe('CONFLICTO');
  });

  it('responde 404 si el pedido no existe', async () => {
    queryMock
      .mockResolvedValueOnce([COCINERO])
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([]);

    const res = await request(app)
      .patch('/api/pedidos/999/estado')
      .set('Cookie', COOKIE(tokenCocinero()))
      .send({ estado: 'Pagado' });

    expect(res.status).toBe(404);
  });

  it('rechaza un estado desconocido con 400', async () => {
    queryMock.mockResolvedValueOnce([COCINERO]);

    const res = await request(app)
      .patch('/api/pedidos/7/estado')
      .set('Cookie', COOKIE(tokenCocinero()))
      .send({ estado: 'Volando' });

    expect(res.status).toBe(400);
  });
});
