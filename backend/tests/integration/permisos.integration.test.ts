import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { crearMenuHoy, crearUsuario, iniciarSesion, limpiarDatos } from './helpers';

beforeAll(async () => {
  await limpiarDatos();
});

describe('Permisos y propiedad contra MySQL real', () => {
  it('un cliente no puede ver el pedido de otro (404, sin revelar existencia)', async () => {
    const menu = await crearMenuHoy(10);
    const clienteA = await crearUsuario('usuario');
    const clienteB = await crearUsuario('usuario');
    const cookieA = await iniciarSesion(app, clienteA.correo);
    const cookieB = await iniciarSesion(app, clienteB.correo);

    const pedido = await request(app)
      .post('/api/pedidos')
      .set('Cookie', cookieA)
      .send({ lineas: [{ platilloId: menu.platilloId, cantidad: 1 }] });
    expect(pedido.status).toBe(201);

    const ajeno = await request(app)
      .get(`/api/pedidos/${pedido.body.id}`)
      .set('Cookie', cookieB);
    expect(ajeno.status).toBe(404);

    const propio = await request(app)
      .get(`/api/pedidos/${pedido.body.id}`)
      .set('Cookie', cookieA);
    expect(propio.status).toBe(200);
  });

  it('bloquea las operaciones fuera del rol', async () => {
    const cliente = await crearUsuario('usuario');
    const cajero = await crearUsuario('cajero');
    const cocinero = await crearUsuario('cocinero');
    const cookieCliente = await iniciarSesion(app, cliente.correo);
    const cookieCajero = await iniciarSesion(app, cajero.correo);
    const cookieCocinero = await iniciarSesion(app, cocinero.correo);

    const listar = await request(app).get('/api/pedidos').set('Cookie', cookieCliente);
    expect(listar.status).toBe(403);

    const miosCajero = await request(app)
      .get('/api/pedidos/mios')
      .set('Cookie', cookieCajero);
    expect(miosCajero.status).toBe(403);

    const mostradorCocinero = await request(app)
      .post('/api/pedidos/mostrador')
      .set('Cookie', cookieCocinero)
      .send({ items: [{ menu_dia_id: 1, cantidad: 1 }] });
    expect(mostradorCocinero.status).toBe(403);

    const estadoCliente = await request(app)
      .patch('/api/pedidos/1/estado')
      .set('Cookie', cookieCliente)
      .send({ estado: 'Listo' });
    expect(estadoCliente.status).toBe(403);
  });
});
