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
const CAJERO = { id: 2, nombre: 'Cajero', correo: 'cajero@cafeitsh.local', activo: 1, rol: 'cajero' };
const tokenCliente = () => firmarToken({ sub: 9, rol: 'usuario' });
const tokenCajero = () => firmarToken({ sub: 2, rol: 'cajero' });
const COOKIE = (token: string) => [`token=${token}`];

const PEDIDO = {
  id: 7,
  numero: 'ITS-20261013-0007',
  tipo: 'anticipado',
  estado: 'Pagado',
  total: '60.00',
  usuarioId: 9,
  clienteNombre: null,
  fechaRecoleccion: '2026-10-13 11:00:00',
  creadoEn: '2026-10-13 10:00:00',
};

const DETALLES = [
  {
    id: 1,
    pedidoId: 7,
    platilloId: 3,
    nombre: 'Gordita de frijol',
    cantidad: 2,
    precioUnitario: '30.00',
    subtotal: '60.00',
  },
];

beforeEach(() => {
  queryMock.mockReset();
  conTransaccionMock.mockReset();
  conTransaccionMock.mockImplementation(async (fn: (conn: unknown) => Promise<unknown>) =>
    fn({ execute: vi.fn() }),
  );
});

describe('US1 — mis pedidos', () => {
  it('lista únicamente los pedidos del cliente autenticado (200)', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]).mockResolvedValueOnce([PEDIDO]).mockResolvedValueOnce(DETALLES);

    const res = await request(app).get('/api/pedidos/mios').set('Cookie', COOKIE(tokenCliente()));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ id: 7, estado: 'Pagado', total: 60 });
    expect(res.body[0].lineas[0]).toMatchObject({ platilloId: 3, subtotal: 60 });
    const sqlListado = String(queryMock.mock.calls[1]?.[0]);
    expect(sqlListado).toContain('pe.usuario_id = ?');
    expect(sqlListado).toContain('ORDER BY pe.creado_en DESC');
  });

  it('responde 401 sin sesión', async () => {
    const res = await request(app).get('/api/pedidos/mios');
    expect(res.status).toBe(401);
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('devuelve el detalle de un pedido propio (200)', async () => {
    queryMock
      .mockResolvedValueOnce([CLIENTE])
      .mockResolvedValueOnce([PEDIDO])
      .mockResolvedValueOnce(DETALLES)
      .mockResolvedValueOnce([]);

    const res = await request(app).get('/api/pedidos/7').set('Cookie', COOKIE(tokenCliente()));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 7, total: 60 });
    expect(res.body.lineas).toHaveLength(1);
  });

  it('responde 404 al detalle de un pedido ajeno', async () => {
    queryMock
      .mockResolvedValueOnce([CLIENTE])
      .mockResolvedValueOnce([{ ...PEDIDO, usuarioId: 99 }]);

    const res = await request(app).get('/api/pedidos/7').set('Cookie', COOKIE(tokenCliente()));

    expect(res.status).toBe(404);
  });

  it('prohíbe /pedidos/mios a un rol distinto de cliente (403)', async () => {
    queryMock.mockResolvedValueOnce([CAJERO]);

    const res = await request(app).get('/api/pedidos/mios').set('Cookie', COOKIE(tokenCajero()));

    expect(res.status).toBe(403);
  });
});
