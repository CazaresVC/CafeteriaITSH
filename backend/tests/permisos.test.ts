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

const USUARIOS = {
  usuario: { id: 9, nombre: 'Alumno', correo: 'a@cafeitsh.local', activo: 1, rol: 'usuario' },
  cajero: { id: 2, nombre: 'Cajero', correo: 'c@cafeitsh.local', activo: 1, rol: 'cajero' },
  cocinero: { id: 3, nombre: 'Cocinero', correo: 'k@cafeitsh.local', activo: 1, rol: 'cocinero' },
  administrador: { id: 1, nombre: 'Admin', correo: 'ad@cafeitsh.local', activo: 1, rol: 'administrador' },
};

type Rol = keyof typeof USUARIOS;

const cookie = (rol: Rol) => [`token=${firmarToken({ sub: USUARIOS[rol].id, rol })}`];

beforeEach(() => {
  queryMock.mockReset();
  conTransaccionMock.mockReset();
  conTransaccionMock.mockImplementation(async (fn: (conn: unknown) => Promise<unknown>) =>
    fn({ execute: vi.fn() }),
  );
});

function autenticar(rol: Rol) {
  queryMock.mockResolvedValueOnce([USUARIOS[rol]]);
}

describe('Permisos por rol y propiedad (SC-004)', () => {
  it('un cliente no puede listar la fila de cocina (403)', async () => {
    autenticar('usuario');
    const res = await request(app).get('/api/pedidos').set('Cookie', cookie('usuario'));
    expect(res.status).toBe(403);
  });

  it('un cajero no puede usar /pedidos/mios (403)', async () => {
    autenticar('cajero');
    const res = await request(app).get('/api/pedidos/mios').set('Cookie', cookie('cajero'));
    expect(res.status).toBe(403);
  });

  it('un cocinero no puede crear pedidos de mostrador (403)', async () => {
    autenticar('cocinero');
    const res = await request(app)
      .post('/api/pedidos/mostrador')
      .set('Cookie', cookie('cocinero'))
      .send({ items: [{ menu_dia_id: 1, cantidad: 1 }] });
    expect(res.status).toBe(403);
  });

  it('un cliente no puede cobrar pedidos (403)', async () => {
    autenticar('usuario');
    const res = await request(app)
      .post('/api/pedidos/7/cobro')
      .set('Cookie', cookie('usuario'))
      .send({ metodo: 'efectivo' });
    expect(res.status).toBe(403);
  });

  it('un cliente no puede cambiar el estado de un pedido (403)', async () => {
    autenticar('usuario');
    const res = await request(app)
      .patch('/api/pedidos/7/estado')
      .set('Cookie', cookie('usuario'))
      .send({ estado: 'Listo' });
    expect(res.status).toBe(403);
  });

  it('un cajero no puede ver las notificaciones del cliente (403)', async () => {
    autenticar('cajero');
    const res = await request(app).get('/api/notificaciones/mias').set('Cookie', cookie('cajero'));
    expect(res.status).toBe(403);
  });

  it('un cliente no puede reintentar notificaciones (403)', async () => {
    autenticar('usuario');
    const res = await request(app)
      .post('/api/notificaciones/reintentar')
      .set('Cookie', cookie('usuario'));
    expect(res.status).toBe(403);
  });
});
