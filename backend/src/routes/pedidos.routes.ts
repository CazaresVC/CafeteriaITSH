import { Router } from 'express';
import * as pedidosController from '../controllers/pedidos.controller';
import { requireAuth } from '../middlewares/requireAuth';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import { idParamSchema } from '../utils/schemas';
import {
  cambioEstadoSchema,
  cobroSchema,
  crearMostradorSchema,
  pagoInputSchema,
  pedidoInputSchema,
} from '../utils/schemas/pedidos.schema';

const router = Router();

router.post(
  '/',
  requireAuth,
  requireRole('usuario'),
  validate(pedidoInputSchema),
  pedidosController.crear,
);
router.post(
  '/mostrador',
  requireAuth,
  requireRole('cajero'),
  validate(crearMostradorSchema),
  pedidosController.crearMostrador,
);
router.get('/', requireAuth, requireRole('cajero', 'cocinero'), pedidosController.listar);
router.get('/mios', requireAuth, requireRole('usuario'), pedidosController.listarMios);
router.get(
  '/:id',
  requireAuth,
  requireRole('usuario', 'cajero', 'cocinero'),
  validate(idParamSchema, 'params'),
  pedidosController.obtener,
);
router.post(
  '/:id/pagar',
  requireAuth,
  requireRole('usuario'),
  validate(idParamSchema, 'params'),
  validate(pagoInputSchema),
  pedidosController.pagar,
);
router.post(
  '/:id/cobro',
  requireAuth,
  requireRole('cajero'),
  validate(idParamSchema, 'params'),
  validate(cobroSchema),
  pedidosController.cobrar,
);
router.patch(
  '/:id/estado',
  requireAuth,
  requireRole('cajero', 'cocinero'),
  validate(idParamSchema, 'params'),
  validate(cambioEstadoSchema),
  pedidosController.cambiarEstado,
);

export default router;
