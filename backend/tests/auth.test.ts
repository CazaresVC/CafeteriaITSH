import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';

vi.mock('../src/config/db', () => ({
  query: vi.fn(),
  pool: {},
  cerrarPool: vi.fn(),
}));

import app from '../src/app';
import { query } from '../src/config/db';
import { firmarToken } from '../src/utils/jwt';

const queryMock = query as unknown as Mock;

const USUARIO_ACTIVO = {
  id: 1,
  nombre: 'Administrador',
  correo: 'admin@cafeitsh.local',
  password_hash: '',
  activo: 1,
  rol: 'administrador',
};

const COOKIE = (token: string) => [`token=${token}`];

beforeEach(() => {
  queryMock.mockReset();
});

describe('US1 — inicio de sesión', () => {
  it('inicia sesión con credenciales válidas y emite cookie', async () => {
    const hash = await bcrypt.hash('Secreta123', 4);
    queryMock.mockResolvedValueOnce([{ ...USUARIO_ACTIVO, password_hash: hash }]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'admin@cafeitsh.local', password: 'Secreta123' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, rol: 'administrador' });
    const cookies = String(res.headers['set-cookie'] ?? '');
    expect(cookies).toContain('token=');
    expect(cookies).toContain('HttpOnly');
  });

  it('rechaza contraseña incorrecta con 401 genérico', async () => {
    const hash = await bcrypt.hash('OtraClave1', 4);
    queryMock.mockResolvedValueOnce([{ ...USUARIO_ACTIVO, password_hash: hash }]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'admin@cafeitsh.local', password: 'incorrecta' });

    expect(res.status).toBe(401);
    expect(res.body.error.codigo).toBe('CREDENCIALES_INVALIDAS');
  });

  it('rechaza un correo inexistente sin revelar la cuenta', async () => {
    queryMock.mockResolvedValueOnce([]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'nadie@cafeitsh.local', password: 'cualquiera' });

    expect(res.status).toBe(401);
    expect(res.body.error.codigo).toBe('CREDENCIALES_INVALIDAS');
  });

  it('rechaza datos inválidos con 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'no-es-correo', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.codigo).toBe('DATOS_INVALIDOS');
  });

  it('GET /me sin sesión responde 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('GET /me con cookie válida devuelve el usuario', async () => {
    queryMock.mockResolvedValueOnce([{ ...USUARIO_ACTIVO }]);
    const token = firmarToken({ sub: 1, rol: 'administrador' });

    const res = await request(app).get('/api/auth/me').set('Cookie', COOKIE(token));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, rol: 'administrador' });
  });

  it('GET /me con token de usuario deshabilitado responde 401', async () => {
    queryMock.mockResolvedValueOnce([{ ...USUARIO_ACTIVO, activo: 0 }]);
    const token = firmarToken({ sub: 1, rol: 'administrador' });

    const res = await request(app).get('/api/auth/me').set('Cookie', COOKIE(token));

    expect(res.status).toBe(401);
  });

  it('POST /logout limpia la cookie con 204', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(204);
    const cookies = String(res.headers['set-cookie'] ?? '');
    expect(cookies).toContain('token=');
  });
});

describe('US2 — registro de cliente', () => {
  it('registra un cliente con rol usuario', async () => {
    queryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 4 }])
      .mockResolvedValueOnce({ insertId: 10, affectedRows: 1 });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Alumno', correo: 'alumno@cafeitsh.local', password: 'Password1' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 10, rol: 'usuario', correo: 'alumno@cafeitsh.local' });
  });

  it('ignora el rol enviado y fuerza usuario', async () => {
    queryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 4 }])
      .mockResolvedValueOnce({ insertId: 11, affectedRows: 1 });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Alumno',
        correo: 'alumno2@cafeitsh.local',
        password: 'Password1',
        rol: 'administrador',
      });

    expect(res.status).toBe(201);
    expect(res.body.rol).toBe('usuario');
  });

  it('rechaza correo duplicado con 409', async () => {
    queryMock.mockResolvedValueOnce([{ id: 1 }]);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Alumno', correo: 'admin@cafeitsh.local', password: 'Password1' });

    expect(res.status).toBe(409);
    expect(res.body.error.codigo).toBe('CONFLICTO');
  });

  it('rechaza datos inválidos con 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: '', correo: 'mal', password: '123' });

    expect(res.status).toBe(400);
    expect(queryMock).not.toHaveBeenCalled();
  });
});
