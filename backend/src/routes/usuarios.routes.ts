import { Router } from 'express';
import * as usuariosController from '../controllers/usuarios.controller';
import { requireAuth } from '../middlewares/requireAuth';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import {
  actualizarOperativoSchema,
  crearOperativoSchema,
  idParamSchema,
} from '../utils/schemas';

const router = Router();

router.use(requireAuth, requireRole('administrador'));

router.get('/', usuariosController.listar);
router.post('/', validate(crearOperativoSchema), usuariosController.crear);
router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(actualizarOperativoSchema),
  usuariosController.actualizar,
);
router.delete('/:id', validate(idParamSchema, 'params'), usuariosController.deshabilitar);

export default router;
