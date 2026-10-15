import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import request from 'supertest';

vi.mock('../src/config/db', () => ({
  query: vi.fn(),
  pool: {},
  cerrarPool: vi.fn(),
  conTransaccion: vi.fn(),
}));

vi.mock('../src/services/ventana.service', () => ({
  dentroDeVentana: () => true,
  fechaRecoleccion: () => new Date('2026-10-13T11:00:00'),
}));

import app from '../src/app';
import { conTransaccion, query } from '../src/config/db';
import { firmarToken } from '../src/utils/jwt';
import type { RolNombre } from '../src/utils/roles';

const queryMock = query as unknown as Mock;
const conTransaccionMock = conTransaccion as unknown as Mock;

const CLIENTE = { id: 9, nombre: 'Alumno', correo: 'a@cafeitsh.local', activo: 1, rol: 'usuario' };
const COCINERO = { id: 3, nombre: 'Cocinero', correo: 'k@cafeitsh.local', activo: 1, rol: 'cocinero' };
const cookie = (sub: number, rol: RolNombre) => [`token=${firmarToken({ sub, rol })}`];
const COOKIE_CLIENTE = cookie(9, 'usuario');
const COOKIE_COCINERO = cookie(3, 'cocinero');

const DETALLE = [
  { id: 1, platilloId: 3, nombre: 'Gordita', cantidad: 2, precioUnitario: '30.00', subtotal: '60.00' },
];
const PAGO_ROW = { id: 1, metodo: 'online', monto: '60.00', referencia: 'SIM-DEMO' };

const HEADER = (estado: string) => ({
  id: 7,
  numero: 'ITS-20261013-0007',
  tipo: 'anticipado',
  estado,
  total: '60.00',
  usuarioId: 9,
  clienteNombre: null,
  fechaRecoleccion: '2026-10-13 11:00:00',
  creadoEn: '2026-10-13 10:00:00',
});

let connExecute: Mock;

beforeEach(() => {
  queryMock.mockReset();
  conTransaccionMock.mockReset();
  connExecute = vi.fn(async () => [await queryMock()]);
  conTransaccionMock.mockImplementation(async (fn: (conn: unknown) => Promise<unknown>) =>
    fn({ execute: connExecute }),
  );
});

function mockear(...resultados: unknown[]) {
  queryMock.mockReset();
  for (const resultado of resultados) {
    queryMock.mockResolvedValueOnce(resultado);
  }
}

describe('US3 — flujo completo (menú → pedido → pago → cocina → listo → recogida)', () => {
  it('se completa de principio a fin y el cliente ve el estado final', async () => {
    // 1) El cliente crea un pedido anticipado
    mockear(
      [CLIENTE],
      [{ menuDiaId: 1, platilloId: 3, nombre: 'Gordita', precio: '30.00' }],
      [{ id: 1 }],
      { insertId: 7, affectedRows: 1 },
      { affectedRows: 1 },
    );
    const creado = await request(app)
      .post('/api/pedidos')
      .set('Cookie', COOKIE_CLIENTE)
      .send({ lineas: [{ platilloId: 3, cantidad: 2 }] });
    expect(creado.status).toBe(201);
    expect(creado.body.estado).toBe('Pendiente');

    // 2) El cliente paga en línea
    mockear(
      [CLIENTE],
      [{ id: 7, usuarioId: 9, total: '60.00', estadoId: 1, estado: 'Pendiente' }],
      [{ id: 2 }],
      [{ desde_id: 1 }],
      { affectedRows: 1 },
      { affectedRows: 1 },
      { affectedRows: 1 },
      [HEADER('Pagado')],
      DETALLE,
      [PAGO_ROW],
    );
    const pagado = await request(app)
      .post('/api/pedidos/7/pagar')
      .set('Cookie', COOKIE_CLIENTE)
      .send({ metodo: 'en_linea', tokenPago: 'tok-demo' });
    expect(pagado.status).toBe(200);
    expect(pagado.body.estado).toBe('Pagado');

    // 3) Cocina: Pagado → En preparación
    mockear(
      [COCINERO],
      [{ id: 3 }],
      [{ id: 7, estadoId: 2, usuarioId: 9 }],
      [{ desde_id: 2 }],
      { affectedRows: 1 },
      { affectedRows: 1 },
      [HEADER('En preparación')],
      DETALLE,
      [PAGO_ROW],
      [],
    );
    const enPreparacion = await request(app)
      .patch('/api/pedidos/7/estado')
      .set('Cookie', COOKIE_COCINERO)
      .send({ estado: 'En preparación' });
    expect(enPreparacion.status).toBe(200);

    // 4) Cocina: En preparación → Listo (dispara la notificación)
    mockear(
      [COCINERO],
      [{ id: 4 }],
      [{ id: 7, estadoId: 3, usuarioId: 9 }],
      [{ desde_id: 3 }],
      { affectedRows: 1 },
      { affectedRows: 1 },
      [HEADER('Listo')],
      DETALLE,
      [PAGO_ROW],
      [],
      { affectedRows: 1 },
      { affectedRows: 1 },
    );
    const listo = await request(app)
      .patch('/api/pedidos/7/estado')
      .set('Cookie', COOKIE_COCINERO)
      .send({ estado: 'Listo' });
    expect(listo.status).toBe(200);
    expect(listo.body.estado).toBe('Listo');
    const notificacionInsertada = queryMock.mock.calls.some(([sql]) =>
      String(sql).includes('INSERT INTO notificacion'),
    );
    expect(notificacionInsertada).toBe(true);

    // 5) Cocina: Listo → Entregado (recogida)
    mockear(
      [COCINERO],
      [{ id: 5 }],
      [{ id: 7, estadoId: 4, usuarioId: 9 }],
      [{ desde_id: 4 }],
      { affectedRows: 1 },
      { affectedRows: 1 },
      [HEADER('Entregado')],
      DETALLE,
      [PAGO_ROW],
      [],
    );
    const entregado = await request(app)
      .patch('/api/pedidos/7/estado')
      .set('Cookie', COOKIE_COCINERO)
      .send({ estado: 'Entregado' });
    expect(entregado.status).toBe(200);

    // 6) El cliente ve el estado final en "mis pedidos"
    mockear([CLIENTE], [HEADER('Entregado')], DETALLE);
    const mios = await request(app).get('/api/pedidos/mios').set('Cookie', COOKIE_CLIENTE);
    expect(mios.status).toBe(200);
    expect(mios.body[0].estado).toBe('Entregado');
  });
});
