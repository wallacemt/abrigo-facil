import { Router } from 'express';
import { login, register } from '@/controllers/auth.controller';
import { validate } from '@/middlewares/validate';
import { loginSchema, registerSchema } from '@/schemas/auth.schema';

const router = Router();

router.post('/register', validate({ body: registerSchema }), register);
router.post('/login', validate({ body: loginSchema }), login);

export default router;
