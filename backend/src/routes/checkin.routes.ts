import { Router } from 'express';
import {
	createCheckin,
	registerCheckinExit,
} from '@/controllers/checkin.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate';
import {
	checkinIdParamSchema,
	createCheckinSchema,
} from '@/schemas/checkin.schema';

const router = Router();

router.post(
	'/',
	authMiddleware,
	validate({ body: createCheckinSchema }),
	createCheckin,
);
router.patch(
	'/:id/saida',
	authMiddleware,
	validate({ params: checkinIdParamSchema }),
	registerCheckinExit,
);

export default router;
