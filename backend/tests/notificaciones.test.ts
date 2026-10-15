import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import request from 'supertest';

vi.mock('../src/config/db', () => ({
  query: vi.fn(),
  pool: {},
  cerrarPool: vi.fn(),
  conTransaccion: vi.fn(),
}));

const proveedor = vi.hoisted(() => ({
  enviar: vi.fn(),
}));

vi.mock('../src/services/notificacion.provider', () => ({
  obtenerProveedor: () => ({ canal: 'push', enviar: proveedor.enviar }),
}));

import app from '../src/app';
import { conTransaccion, query } from '../src/config/db';
import { firmarToken } from '../src/utils/jwt';
import type { RolNombre } from '../src/utils/roles';

const queryMock = query as unknown as Mock;
const conTransaccionMock = conTransaccion as unknown as Mock;

const COCINERO = { id: 3, nombre: 'Cocinero', correo: 'cocinero@cafeitsh.local', activo: 1, rol: 'cocinero' };
const CLIENTE = { id: 9, nombre: 'Alumno', correo: 'alumno@cafeitsh.local', activo: 1, rol: 'usuario' };
const CAJERO = { id: 2, nombre: 'Cajero', correo: 'cajero@cafeitsh.local', activo: 1, rol: 'cajero' };
const ADMIN = { id: 1, nombre: 'Admin', correo: 'admin@cafeitsh.local', activo: 1, rol: 'administrador' };

const token = (sub: number, rol: RolNombre) => firmarToken({ sub, rol });
const COOKIE = (valor: string) => [`token=${valor}`];

const HEADER_LISTO = {
  id: 7,
  numero: 'ITS-20261013-0007',
  tipo: 'anticipado',
  estado: 'Listo',
  total: '60.00',
  usuarioId: 9,
  clienteNombre: null,
  fechaRecoleccion: '2026-10-13 11:00:00',
  creadoEn: '2026-10-13 10:00:00',
};

const NOTIF = {
  id: 5,
  pedidoId: 7,
  numero: 'ITS-20261013-0007',
  tipo: 'pedido_listo',
  canal: 'push',
  estadoEnvio: 'enviada',
  fecha: '2026-10-13 10:30:00',
  vista: 0,
  detalleError: null,
};

let connExecute: Mock;

beforeEach(() => {
  queryMock.mockReset();
  proveedor.enviar.mockReset();
  conTransaccionMock.mockReset();
  connExecute = vi.fn(async () => [await queryMock()]);
  conTransaccionMock.mockImplementation(async (fn: (conn: unknown) => Promise<unknown>) =>
    fn({ execute: connExecute }),
  );
});

function programarTransicionAListo() {
  queryMock
    .mockResolvedValueOnce([COCINERO]) // requireAuth
    .mockResolvedValueOnce([{ id: 4 }]) // obtenerEstadoId(Listo)
    .mockResolvedValueOnce([{ id: 7, estadoId: 3, usuarioId: 9 }]) // FOR UPDATE
    .mockResolvedValueOnce([{ desde_id: 3 }]) // validarTransicion
    .mockResolvedValueOnce({ affectedRows: 1 }) // UPDATE estado
    .mockResolvedValueOnce({ affectedRows: 1 }) // INSERT historial
    .mockResolvedValueOnce([HEADER_LISTO]) // obtener header
    .mockResolvedValueOnce([]) // detalles
    .mockResolvedValueOnce([]) // pago
    .mockResolvedValueOnce([]) // historial
    .mockResolvedValueOnce({ affectedRows: 1 }) // INSERT notificacion
    .mockResolvedValueOnce({ affectedRows: 1 }); // UPDATE notificacion
}

function pasarAListo() {
  return request(app)
    .patch('/api/pedidos/7/estado')
    .set('Cookie', COOKIE(token(3, 'cocinero')))
    .send({ estado: 'Listo' });
}

describe('US2 — notificación de pedido listo', () => {
  it('el 100% de los "Listo" genera una notificación (200)', async () => {
    programarTransicionAListo();
    proveedor.enviar.mockResolvedValue({ exito: true });

    const res = await pasarAListo();

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('Listo');
    expect(proveedor.enviar).toHaveBeenCalledTimes(1);
    expect(proveedor.enviar).toHaveBeenCalledWith(
      expect.objectContaining({ pedidoId: 7, numero: 'ITS-20261013-0007', tipo: 'pedido_listo' }),
    );
    const insertNotif = queryMock.mock.calls.find(([sql]) =>
      String(sql).includes('INSERT INTO notificacion'),
    );
    expect(insertNotif).toBeTruthy();
    expect(String(insertNotif?.[0])).toContain('ON DUPLICATE KEY UPDATE');
  });

  it('un fallo del canal deja el aviso "fallida" y el pedido intacto', async () => {
    programarTransicionAListo();
    proveedor.enviar.mockResolvedValue({ exito: false, detalleError: 'canal caído' });

    const res = await pasarAListo();

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('Listo');
    const actualizacion = queryMock.mock.calls.find(
      ([, parametros]) => Array.isArray(parametros) && parametros.includes('fallida'),
    );
    expect(actualizacion).toBeTruthy();
  });

  it('es idempotente: el insert usa ON DUPLICATE KEY UPDATE (no duplica avisos)', async () => {
    programarTransicionAListo();
    proveedor.enviar.mockResolvedValue({ exito: true });
    await pasarAListo();

    programarTransicionAListo();
    proveedor.enviar.mockResolvedValue({ exito: true });
    await pasarAListo();

    const inserciones = queryMock.mock.calls.filter(([sql]) =>
      String(sql).includes('INSERT INTO notificacion'),
    );
    expect(inserciones).toHaveLength(2);
    for (const insercion of inserciones) {
      expect(String(insercion[0])).toContain('ON DUPLICATE KEY UPDATE');
    }
  });
});

describe('US2 — consultar y ver avisos propios', () => {
  it('lista las notificaciones propias (200)', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]).mockResolvedValueOnce([NOTIF]);

    const res = await request(app)
      .get('/api/notificaciones/mias')
      .set('Cookie', COOKIE(token(9, 'usuario')));

    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ id: 5, pedidoId: 7, tipo: 'pedido_listo', vista: false });
  });

  it('marca como vista una notificación propia (200)', async () => {
    queryMock
      .mockResolvedValueOnce([CLIENTE])
      .mockResolvedValueOnce([NOTIF])
      .mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .patch('/api/notificaciones/5/vista')
      .set('Cookie', COOKIE(token(9, 'usuario')));

    expect(res.status).toBe(200);
    expect(res.body.vista).toBe(true);
  });

  it('responde 404 al marcar una notificación ajena', async () => {
    queryMock.mockResolvedValueOnce([CLIENTE]).mockResolvedValueOnce([]);

    const res = await request(app)
      .patch('/api/notificaciones/5/vista')
      .set('Cookie', COOKIE(token(9, 'usuario')));

    expect(res.status).toBe(404);
  });

  it('prohíbe /notificaciones/mias a un rol distinto de cliente (403)', async () => {
    queryMock.mockResolvedValueOnce([CAJERO]);

    const res = await request(app)
      .get('/api/notificaciones/mias')
      .set('Cookie', COOKIE(token(2, 'cajero')));

    expect(res.status).toBe(403);
  });
});

describe('US2 — reintento de avisos fallidos', () => {
  it('reintenta las fallidas (admin) sin duplicar (200)', async () => {
    queryMock
      .mockResolvedValueOnce([ADMIN])
      .mockResolvedValueOnce([{ ...NOTIF, estadoEnvio: 'fallida' }])
      .mockResolvedValueOnce({ affectedRows: 1 });
    proveedor.enviar.mockResolvedValue({ exito: true });

    const res = await request(app)
      .post('/api/notificaciones/reintentar')
      .set('Cookie', COOKIE(token(1, 'administrador')));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ enviadas: 1 });
  });
});
