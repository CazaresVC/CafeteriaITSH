import { Router } from 'express';
import * as menuController from '../controllers/menu.controller';
import { requireAuth } from '../middlewares/requireAuth';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import { idParamSchema } from '../utils/schemas';
import {
  menuItemInputSchema,
  menuItemPatchSchema,
  menuRepublicarSchema,
} from '../utils/schemas/menu.schema';

const router = Router();

router.get('/', requireAuth, menuController.listar);
router.post(
  '/',
  requireAuth,
  requireRole('administrador'),
  validate(menuItemInputSchema),
  menuController.agregar,
);
router.post(
  '/republicar',
  requireAuth,
  requireRole('administrador'),
  validate(menuRepublicarSchema),
  menuController.republicar,
);
router.patch(
  '/:id',
  requireAuth,
  requireRole('administrador'),
  validate(idParamSchema, 'params'),
  validate(menuItemPatchSchema),
  menuController.actualizar,
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('administrador'),
  validate(idParamSchema, 'params'),
  menuController.quitar,
);

export default router;
