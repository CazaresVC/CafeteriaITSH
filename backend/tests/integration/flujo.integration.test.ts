import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import {
  crearMenuHoy,
  crearUsuario,
  correoUnico,
  fechaHoyDb,
  iniciarSesion,
  limpiarDatos,
  PASSWORD,
} from './helpers';

beforeAll(async () => {
  await limpiarDatos();
});

describe('Flujo completo contra MySQL real', () => {
  it('recorre menú → pedido → pago → cocina → listo → notificación → entrega', async () => {
    const menu = await crearMenuHoy(12.5);
    const hoy = await fechaHoyDb();
    const correoCliente = correoUnico('cliente');

    const registro = await request(app).post('/api/auth/register').send({
      nombre: 'Cliente de integración',
      correo: correoCliente,
      password: PASSWORD,
    });
    expect(registro.status).toBe(201);
    expect(registro.body.rol).toBe('usuario');

    const cookieCliente = await iniciarSesion(app, correoCliente);

    const menuRespuesta = await request(app)
      .get('/api/menu')
      .query({ fecha: hoy })
      .set('Cookie', cookieCliente);
    expect(menuRespuesta.status).toBe(200);
    const item = menuRespuesta.body.find(
      (fila: { platilloId: number }) => fila.platilloId === menu.platilloId,
    );
    expect(item).toBeDefined();
    expect(item.precio).toBe(12.5);
    expect(item.disponible).toBe(true);

    const pedidoRespuesta = await request(app)
      .post('/api/pedidos')
      .set('Cookie', cookieCliente)
      .send({ lineas: [{ platilloId: menu.platilloId, cantidad: 2 }] });
    expect(pedidoRespuesta.status).toBe(201);
    expect(pedidoRespuesta.body.estado).toBe('Pendiente');
    expect(pedidoRespuesta.body.total).toBe(25);
    const pedidoId = pedidoRespuesta.body.id as number;

    const pagoRespuesta = await request(app)
      .post(`/api/pedidos/${pedidoId}/pagar`)
      .set('Cookie', cookieCliente)
      .send({ metodo: 'en_linea', tokenPago: 'aprobado' });
    expect(pagoRespuesta.status).toBe(200);
    expect(pagoRespuesta.body.estado).toBe('Pagado');
    expect(pagoRespuesta.body.pago.metodo).toBe('online');

    const cocinero = await crearUsuario('cocinero');
    const cookieCocina = await iniciarSesion(app, cocinero.correo);

    const preparacion = await request(app)
      .patch(`/api/pedidos/${pedidoId}/estado`)
      .set('Cookie', cookieCocina)
      .send({ estado: 'En preparación' });
    expect(preparacion.status).toBe(200);
    expect(preparacion.body.estado).toBe('En preparación');

    const listo = await request(app)
      .patch(`/api/pedidos/${pedidoId}/estado`)
      .set('Cookie', cookieCocina)
      .send({ estado: 'Listo' });
    expect(listo.status).toBe(200);
    expect(listo.body.estado).toBe('Listo');

    const notificaciones = await request(app)
      .get('/api/notificaciones/mias')
      .set('Cookie', cookieCliente);
    expect(notificaciones.status).toBe(200);
    const aviso = notificaciones.body.find(
      (fila: { pedidoId: number }) => fila.pedidoId === pedidoId,
    );
    expect(aviso).toBeDefined();
    expect(aviso.estadoEnvio).toBe('enviada');

    const entrega = await request(app)
      .patch(`/api/pedidos/${pedidoId}/estado`)
      .set('Cookie', cookieCocina)
      .send({ estado: 'Entregado' });
    expect(entrega.status).toBe(200);
    expect(entrega.body.estado).toBe('Entregado');

    const detalle = await request(app)
      .get(`/api/pedidos/${pedidoId}`)
      .set('Cookie', cookieCliente);
    expect(detalle.status).toBe(200);
    expect(detalle.body.estado).toBe('Entregado');
    expect(detalle.body.lineas).toHaveLength(1);
    expect(detalle.body.lineas[0].cantidad).toBe(2);
  });
});
