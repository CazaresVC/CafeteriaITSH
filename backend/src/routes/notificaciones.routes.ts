import { Router } from 'express';
import * as notificacionesController from '../controllers/notificaciones.controller';
import { requireAuth } from '../middlewares/requireAuth';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import { idParamSchema } from '../utils/schemas';

const router = Router();

router.get('/mias', requireAuth, requireRole('usuario'), notificacionesController.listarMias);
router.patch(
  '/:id/vista',
  requireAuth,
  requireRole('usuario'),
  validate(idParamSchema, 'params'),
  notificacionesController.marcarVista,
);
router.post('/reintentar', requireAuth, requireRole('administrador'), notificacionesController.reintentar);

export default router;
