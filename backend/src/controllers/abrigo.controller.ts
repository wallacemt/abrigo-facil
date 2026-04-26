import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { Constants } from '@/config/constants';
import {
	CreateAbrigoInput,
	ListAbrigoQuery,
	UpdateVagasInput,
} from '@/schemas/abrigo.schema';
import { abrigoService } from '@/services/abrigo.service';

export const listAbrigos = asyncHandler(async (req: Request, res: Response) => {
	const query = (req.validated?.query ?? req.query) as ListAbrigoQuery;
	const data = await abrigoService.list(query);

	res.status(Constants.HTTP_STATUS.OK).json({
		status: 'success',
		data,
	});
});

export const getAbrigoDetails = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = (req.validated?.params ?? req.params) as { id: string };
		const data = await abrigoService.details(id);

		res.status(Constants.HTTP_STATUS.OK).json({
			status: 'success',
			data,
		});
	},
);

export const createAbrigo = asyncHandler(
	async (req: Request, res: Response) => {
		const input = (req.validated?.body ?? req.body) as CreateAbrigoInput;
		const data = await abrigoService.create(input, req.user!.id);

		res.status(Constants.HTTP_STATUS.CREATED).json({
			status: 'success',
			data,
		});
	},
);

export const updateAbrigoVagas = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = (req.validated?.params ?? req.params) as { id: string };
		const input = (req.validated?.body ?? req.body) as UpdateVagasInput;
		const data = await abrigoService.updateVagas(id, input, req.user!.id);

		res.status(Constants.HTTP_STATUS.OK).json({
			status: 'success',
			data,
		});
	},
);

export const deactivateAbrigo = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = (req.validated?.params ?? req.params) as { id: string };
		await abrigoService.deactivate(id, req.user!.id);

		res.status(Constants.HTTP_STATUS.OK).json({
			status: 'success',
			message: 'Abrigo desativado com sucesso.',
		});
	},
);
