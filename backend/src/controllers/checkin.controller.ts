import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { CreateCheckinInput } from '@/schemas/checkin.schema';
import { Constants } from '@/config/constants';
import { checkinService } from '@/services/checkin.service';

export const createCheckin = asyncHandler(
	async (req: Request, res: Response) => {
		const input = (req.validated?.body ?? req.body) as CreateCheckinInput;
		const usuarioId = req.user?.id;
		const { isRecoveredMissing, result } =
			await checkinService.createByCode(input, usuarioId);

		res.status(Constants.HTTP_STATUS.CREATED).json({
			status: 'success',
			...(isRecoveredMissing
				? {
						message:
							'Pessoa com registro de desaparecida localizada automaticamente via check-in.',
					}
				: {}),
			data: {
				id: result.checkin.id,
				pessoa: {
					id: result.pessoa.id,
					nome: result.pessoa.nome,
					status: result.pessoa.status,
				},
				abrigo: {
					id: result.abrigo.id,
					nome: result.abrigo.nome,
				},
				data_entrada: result.checkin.data_entrada,
			},
		});
	},
);

export const registerCheckinExit = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = (req.validated?.params ?? req.params) as { id: string };
		const closedCheckin = await checkinService.registerExit(id);

		res.status(Constants.HTTP_STATUS.OK).json({
			status: 'success',
			data: {
				id: closedCheckin.id,
				data_saida: closedCheckin.data_saida,
			},
		});
	},
);
