import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import usuariosRoutes from './routes/usuarios.routes';
import platillosRoutes from './routes/platillos.routes';
import menuRoutes from './routes/menu.routes';
import pedidosRoutes from './routes/pedidos.routes';
import notificacionesRoutes from './routes/notificaciones.routes';
import { onPedidoListo } from './services/eventosPedido';
import * as notificacionesService from './services/notificaciones.service';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { env } from './config/env';

onPedidoListo((evento) => notificacionesService.emitirPedidoListo(evento));

export function crearApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ estado: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/usuarios', usuariosRoutes);
  app.use('/api/platillos', platillosRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/pedidos', pedidosRoutes);
  app.use('/api/notificaciones', notificacionesRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

const app = crearApp();

export default app;
