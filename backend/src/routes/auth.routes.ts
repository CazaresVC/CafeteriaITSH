import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/requireAuth';
import { loginSchema, registroSchema } from '../utils/schemas';

const router = Router();

router.post('/register', validate(registroSchema), authController.registro);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
