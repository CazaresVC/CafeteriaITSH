import { Router } from 'express';
import * as pedidosController from '../controllers/pedidos.controller';
import { requireAuth } from '../middlewares/requireAuth';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import { idParamSchema } from '../utils/schemas';
import { pagoInputSchema, pedidoInputSchema } from '../utils/schemas/pedidos.schema';

const router = Router();

router.use(requireAuth, requireRole('usuario'));

router.post('/', validate(pedidoInputSchema), pedidosController.crear);
router.get('/:id', validate(idParamSchema, 'params'), pedidosController.obtener);
router.post(
  '/:id/pagar',
  validate(idParamSchema, 'params'),
  validate(pagoInputSchema),
  pedidosController.pagar,
);

export default router;
