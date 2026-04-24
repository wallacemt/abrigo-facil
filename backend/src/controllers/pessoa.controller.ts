import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { Constants } from '@/config/constants';
import { BuscarPessoaQuery, CreatePessoaInput } from '@/schemas/pessoa.schema';
import { pessoaService } from '@/services/pessoa.service';

export const createPessoa = asyncHandler(
	async (req: Request, res: Response) => {
		const input = (req.validated?.body ?? req.body) as CreatePessoaInput;
		const data = await pessoaService.create(input);

		res.status(Constants.HTTP_STATUS.CREATED).json({
			status: 'success',
			data,
		});
	},
);

export const buscarPessoas = asyncHandler(
	async (req: Request, res: Response) => {
		const query = (req.validated?.query ?? req.query) as BuscarPessoaQuery;
		const data = await pessoaService.search(query);

		res.status(Constants.HTTP_STATUS.OK).json({
			status: 'success',
			data,
		});
	},
);
