import { Router } from 'express';
import {
	createAbrigo,
	deactivateAbrigo,
	getAbrigoDetails,
	listAbrigos,
	updateAbrigoVagas,
} from '@/controllers/abrigo.controller';
import { authMiddleware, authorizeRoles } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate';
import {
	abrigoIdParamSchema,
	createAbrigoSchema,
	listAbrigoQuerySchema,
	updateVagasSchema,
} from '@/schemas/abrigo.schema';

const router = Router();

router.get('/', validate({ query: listAbrigoQuerySchema }), listAbrigos);
router.get('/:id', validate({ params: abrigoIdParamSchema }), getAbrigoDetails);
router.post(
	'/',
	authMiddleware,
	authorizeRoles('coordenador'),
	validate({ body: createAbrigoSchema }),
	createAbrigo,
);
router.patch(
	'/:id/vagas',
	authMiddleware,
	authorizeRoles('coordenador'),
	validate({ params: abrigoIdParamSchema, body: updateVagasSchema }),
	updateAbrigoVagas,
);
router.patch(
	'/:id/desativar',
	authMiddleware,
	authorizeRoles('coordenador'),
	validate({ params: abrigoIdParamSchema }),
	deactivateAbrigo,
);

export default router;
