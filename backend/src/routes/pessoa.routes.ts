import { Router } from 'express';
import { buscarPessoas, createPessoa } from '@/controllers/pessoa.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate';
import {
	buscarPessoaSchema,
	createPessoaSchema,
} from '@/schemas/pessoa.schema';

const router = Router();

router.get('/buscar', validate({ query: buscarPessoaSchema }), buscarPessoas);
router.post(
	'/',
	authMiddleware,
	validate({ body: createPessoaSchema }),
	createPessoa,
);

export default router;
