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

const ESTADOS = { Pendiente: 1, Pagado: 2, 'En preparación': 3, Listo: 4, Entregado: 5, Cancelado: 6 };
const COCINERO = { id: 3, nombre: 'Cocinero', correo: 'k@cafeitsh.local', activo: 1, rol: 'cocinero' };
const CLIENTE = { id: 9, nombre: 'Alumno', correo: 'a@cafeitsh.local', activo: 1, rol: 'usuario' };
const COOKIE = (token: string) => [`token=${token}`];

const HEADER = (estado: string) => ({
  id: 7,
  numero: 'ITS-20261013-0007',
  tipo: 'anticipado',
  estado,
  total: '60.00',
  usuarioId: 9,
  clienteNombre: null,
  fechaRecoleccion: null,
  creadoEn: '2026-10-13 10:00:00',
});

const DETALLE = [
  { id: 1, platilloId: 3, nombre: 'Gordita', cantidad: 2, precioUnitario: '30.00', subtotal: '60.00' },
];

let connExecute: Mock;

beforeEach(() => {
  queryMock.mockReset();
  conTransaccionMock.mockReset();
  connExecute = vi.fn(async () => [await queryMock()]);
  conTransaccionMock.mockImplementation(async (fn: (conn: unknown) => Promise<unknown>) =>
    fn({ execute: connExecute }),
  );
});

function programar(desde: number, hacia: number, haciaNombre: string, valido: boolean) {
  queryMock
    .mockResolvedValueOnce([COCINERO])
    .mockResolvedValueOnce([{ id: hacia }])
    .mockResolvedValueOnce([{ id: 7, estadoId: desde, usuarioId: 9 }])
    .mockResolvedValueOnce(valido ? [{ desde_id: desde }] : []);
  if (valido) {
    queryMock
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([HEADER(haciaNombre)])
      .mockResolvedValueOnce(DETALLE)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
  }
}

function cambiar(estado: string) {
  return request(app)
    .patch('/api/pedidos/7/estado')
    .set('Cookie', COOKIE(firmarToken({ sub: 3, rol: 'cocinero' })))
    .send({ estado });
}

describe('Regresión — máquina de estados', () => {
  it('permite Pagado → En preparación (200)', async () => {
    programar(ESTADOS.Pagado, ESTADOS['En preparación'], 'En preparación', true);
    const res = await cambiar('En preparación');
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('En preparación');
  });

  it('rechaza el salto Pendiente → Listo (409)', async () => {
    programar(ESTADOS.Pendiente, ESTADOS.Listo, 'Listo', false);
    const res = await cambiar('Listo');
    expect(res.status).toBe(409);
    expect(res.body.error.codigo).toBe('CONFLICTO');
  });

  it('rechaza cambios sobre un estado terminal Entregado (409)', async () => {
    programar(ESTADOS.Entregado, ESTADOS.Cancelado, 'Cancelado', false);
    const res = await cambiar('Cancelado');
    expect(res.status).toBe(409);
  });
});

describe('Regresión — pago en línea', () => {
  it('rechaza el pago y deja el pedido en Pendiente (422)', async () => {
    queryMock
      .mockResolvedValueOnce([CLIENTE])
      .mockResolvedValueOnce([{ id: 7, usuarioId: 9, total: '60.00', estadoId: 1, estado: 'Pendiente' }]);

    const res = await request(app)
      .post('/api/pedidos/7/pagar')
      .set('Cookie', COOKIE(firmarToken({ sub: 9, rol: 'usuario' })))
      .send({ metodo: 'en_linea', tokenPago: 'rechazar' });

    expect(res.status).toBe(422);
    expect(res.body.error.codigo).toBe('PAGO_RECHAZADO');
    expect(conTransaccionMock).not.toHaveBeenCalled();
  });
});
