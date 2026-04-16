import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { pessoaModel } from '@/models';
import { Constants } from '@/config/constants';
import { BuscarPessoaQuery, CreatePessoaInput } from '@/schemas/pessoa.schema';

export const createPessoa = asyncHandler(
	async (req: Request, res: Response) => {
		const input = req.body as CreatePessoaInput;
		const data = await pessoaModel.create(input);

		res.status(Constants.HTTP_STATUS.CREATED).json({
			status: 'success',
			data,
		});
	},
);

export const buscarPessoas = asyncHandler(
	async (req: Request, res: Response) => {
		const query = req.query as unknown as BuscarPessoaQuery;
		const data = await pessoaModel.searchByName(query.nome);

		res.status(Constants.HTTP_STATUS.OK).json({
			status: 'success',
			data,
		});
	},
);
