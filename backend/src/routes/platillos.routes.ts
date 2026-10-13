import { Router } from 'express';
import * as platillosController from '../controllers/platillos.controller';
import { requireAuth } from '../middlewares/requireAuth';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import { idParamSchema } from '../utils/schemas';
import { platilloInputSchema, platilloPatchSchema } from '../utils/schemas/platillos.schema';

const router = Router();

router.get('/', requireAuth, platillosController.listar);
router.post(
  '/',
  requireAuth,
  requireRole('administrador'),
  validate(platilloInputSchema),
  platillosController.crear,
);
router.patch(
  '/:id',
  requireAuth,
  requireRole('administrador'),
  validate(idParamSchema, 'params'),
  validate(platilloPatchSchema),
  platillosController.editar,
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('administrador'),
  validate(idParamSchema, 'params'),
  platillosController.desactivar,
);

export default router;
