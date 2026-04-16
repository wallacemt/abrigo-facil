import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/asyncHandler';

import ApiError from '@/utils/ApiError';
import { Constants } from '@/config/constants';
import {
	CreateAbrigoInput,
	ListAbrigoQuery,
	UpdateVagasInput,
} from '@/schemas/abrigo.schema';
import { abrigoModel } from '@/models/abrigo.model';

export const listAbrigos = asyncHandler(async (req: Request, res: Response) => {
	const query = req.query as unknown as ListAbrigoQuery;

	const data = await abrigoModel.list({
		lat: query.lat,
		lng: query.lng,
		apenasComVagas: query.apenas_com_vagas,
	});

	res.status(Constants.HTTP_STATUS.OK).json({
		status: 'success',
		data,
	});
});

export const getAbrigoDetails = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params as { id: string };

		const data = await abrigoModel.getDetails(id);
		if (!data) {
			throw new ApiError(
				Constants.HTTP_STATUS.NOT_FOUND,
				'Abrigo não encontrado.',
			);
		}

		res.status(Constants.HTTP_STATUS.OK).json({
			status: 'success',
			data,
		});
	},
);

export const createAbrigo = asyncHandler(
	async (req: Request, res: Response) => {
		const input = req.body as CreateAbrigoInput;

		const data = await abrigoModel.create(input);

		res.status(Constants.HTTP_STATUS.CREATED).json({
			status: 'success',
			data,
		});
	},
);

export const updateAbrigoVagas = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params as { id: string };
		const input = req.body as UpdateVagasInput;

		const abrigo = await abrigoModel.findById(id);
		if (!abrigo) {
			throw new ApiError(
				Constants.HTTP_STATUS.NOT_FOUND,
				'Abrigo não encontrado.',
			);
		}

		if (!abrigo.ativo) {
			throw new ApiError(
				Constants.HTTP_STATUS.BAD_REQUEST,
				'Não é possível atualizar vagas de abrigo desativado.',
			);
		}

		const data = await abrigoModel.updateVagas(id, input.vagas_disponiveis);
		if (!data) {
			throw new ApiError(
				Constants.HTTP_STATUS.BAD_REQUEST,
				'Valor de vagas inválido para a capacidade do abrigo.',
				true,
				[
					{
						field: 'vagas_disponiveis',
						message:
							'O valor deve ser menor ou igual à capacidade total.',
					},
				],
			);
		}

		res.status(Constants.HTTP_STATUS.OK).json({
			status: 'success',
			data,
		});
	},
);

export const deactivateAbrigo = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params as { id: string };
		const success = await abrigoModel.deactivate(id);

		if (!success) {
			throw new ApiError(
				Constants.HTTP_STATUS.NOT_FOUND,
				'Abrigo não encontrado.',
			);
		}

		res.status(Constants.HTTP_STATUS.OK).json({
			status: 'success',
			message: 'Abrigo desativado com sucesso.',
		});
	},
);
