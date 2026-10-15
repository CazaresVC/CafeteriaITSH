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
const tokenCocinero = () => firmarToken({ sub: 3, rol: 'cocinero' });
const COOKIE = (token: string) => [`token=${token}`];

const ESTADO = { Pendiente: 1, Pagado: 2, 'En preparación': 3, Listo: 4, Entregado: 5, Cancelado: 6 };

const DETALLE = [
  {
    id: 1,
    platilloId: 3,
    nombre: 'Gordita de frijol',
    cantidad: 2,
    precioUnitario: '30.00',
    subtotal: '60.00',
  },
];
const PAGO = { id: 1, metodo: 'efectivo', monto: '60.00', referencia: null };

function header(estado: string) {
  return {
    id: 7,
    numero: 'ITS-20261013-0007',
    tipo: 'mostrador',
    estado,
    total: '60.00',
    usuarioId: null,
    clienteNombre: 'Juan',
    fechaRecoleccion: null,
    creadoEn: '2026-10-13 10:00:00',
  };
}

let connExecute: Mock;

beforeEach(() => {
  queryMock.mockReset();
  conTransaccionMock.mockReset();
  connExecute = vi.fn(async (sql: string, parametros: unknown[]) => [await queryMock(sql, parametros)]);
  conTransaccionMock.mockImplementation(async (fn: (conn: unknown) => Promise<unknown>) =>
    fn({ execute: connExecute }),
  );
});

function programarCambio(desdeNombre: string, haciaNombre: string, haciaId: number) {
  queryMock
    .mockResolvedValueOnce([COCINERO])
    .mockResolvedValueOnce([{ id: haciaId }])
    .mockResolvedValueOnce([{ id: 7, estadoId: ESTADO[desdeNombre as keyof typeof ESTADO] }])
    .mockResolvedValueOnce([{ desde_id: ESTADO[desdeNombre as keyof typeof ESTADO] }])
    .mockResolvedValueOnce({ affectedRows: 1 })
    .mockResolvedValueOnce({ affectedRows: 1 })
    .mockResolvedValueOnce([header(haciaNombre)])
    .mockResolvedValueOnce(DETALLE)
    .mockResolvedValueOnce([PAGO])
    .mockResolvedValueOnce([
      {
        estadoAnterior: desdeNombre,
        estadoNuevo: haciaNombre,
        cambiadoPor: 3,
        fecha: '2026-10-13 10:05:00',
      },
    ]);
}

function pedir(estado: string) {
  return request(app)
    .patch('/api/pedidos/7/estado')
    .set('Cookie', COOKIE(tokenCocinero()))
    .send({ estado });
}

describe('US3 — entrega y cancelación de pedidos', () => {
  it('Listo → Entregado (200)', async () => {
    programarCambio('Listo', 'Entregado', ESTADO.Entregado);

    const res = await pedir('Entregado');

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('Entregado');
  });

  it('Pagado → Cancelado (200)', async () => {
    programarCambio('Pagado', 'Cancelado', ESTADO.Cancelado);

    const res = await pedir('Cancelado');

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('Cancelado');
  });

  it('En preparación → Cancelado (200)', async () => {
    programarCambio('En preparación', 'Cancelado', ESTADO.Cancelado);

    const res = await pedir('Cancelado');

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('Cancelado');
  });

  it('rechaza cambios sobre un pedido Entregado (409)', async () => {
    queryMock
      .mockResolvedValueOnce([COCINERO])
      .mockResolvedValueOnce([{ id: ESTADO.Pendiente }])
      .mockResolvedValueOnce([{ id: 7, estadoId: ESTADO.Entregado }])
      .mockResolvedValueOnce([]);

    const res = await pedir('Pendiente');

    expect(res.status).toBe(409);
    expect(res.body.error.codigo).toBe('CONFLICTO');
  });

  it('rechaza cambios sobre un pedido Cancelado (409)', async () => {
    queryMock
      .mockResolvedValueOnce([COCINERO])
      .mockResolvedValueOnce([{ id: ESTADO.Pagado }])
      .mockResolvedValueOnce([{ id: 7, estadoId: ESTADO.Cancelado }])
      .mockResolvedValueOnce([]);

    const res = await pedir('Pagado');

    expect(res.status).toBe(409);
  });

  it('rechaza un salto Pagado → Listo (409)', async () => {
    queryMock
      .mockResolvedValueOnce([COCINERO])
      .mockResolvedValueOnce([{ id: ESTADO.Listo }])
      .mockResolvedValueOnce([{ id: 7, estadoId: ESTADO.Pagado }])
      .mockResolvedValueOnce([]);

    const res = await pedir('Listo');

    expect(res.status).toBe(409);
  });
});

describe('Concurrencia — dos actualizaciones al mismo destino', () => {
  it('la primera gana (200) y la segunda recibe 409', async () => {
    programarCambio('Pagado', 'En preparación', ESTADO['En preparación']);
    const primera = await pedir('En preparación');
    expect(primera.status).toBe(200);

    queryMock
      .mockResolvedValueOnce([COCINERO])
      .mockResolvedValueOnce([{ id: ESTADO['En preparación'] }])
      .mockResolvedValueOnce([{ id: 7, estadoId: ESTADO['En preparación'] }])
      .mockResolvedValueOnce([]);
    const segunda = await pedir('En preparación');
    expect(segunda.status).toBe(409);
    expect(segunda.body.error.codigo).toBe('CONFLICTO');
  });
});
