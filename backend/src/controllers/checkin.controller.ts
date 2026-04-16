import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { CreateCheckinInput } from '@/schemas/checkin.schema';
import { abrigoModel, checkinModel, pessoaModel } from '@/models';
import ApiError from '@/utils/ApiError';
import { Constants } from '@/config/constants';
import { db } from '@/config/database';

export const createCheckin = asyncHandler(
	async (req: Request, res: Response) => {
		const input = req.body as CreateCheckinInput;
		const usuarioId = req.user?.id;

		const pessoa = await pessoaModel.findById(input.pessoa_id);
		if (!pessoa) {
			throw new ApiError(
				Constants.HTTP_STATUS.NOT_FOUND,
				'Pessoa não encontrada.',
			);
		}

		const activeCheckin = await checkinModel.findActiveByPessoaId(
			input.pessoa_id,
		);
		if (activeCheckin) {
			throw new ApiError(
				Constants.HTTP_STATUS.CONFLICT,
				'Pessoa já possui check-in ativo em um abrigo.',
			);
		}

		const transactionResult = await db.withTransaction(async (client) => {
			const abrigo = await abrigoModel.decrementVagas(
				client,
				input.abrigo_id,
			);
			if (!abrigo) {
				throw new ApiError(
					Constants.HTTP_STATUS.CONFLICT,
					'Abrigo indisponível, lotado ou desativado.',
				);
			}

			const checkin = await checkinModel.create(client, {
				pessoa_id: input.pessoa_id,
				abrigo_id: input.abrigo_id,
				usuario_id: usuarioId,
			});

			const pessoaAtualizada = await pessoaModel.updateStatus(
				client,
				input.pessoa_id,
				'em_abrigo',
			);

			if (!pessoaAtualizada) {
				throw new ApiError(
					Constants.HTTP_STATUS.NOT_FOUND,
					'Pessoa não encontrada.',
				);
			}

			return {
				checkin,
				abrigo,
				pessoa: pessoaAtualizada,
			};
		});

		res.status(Constants.HTTP_STATUS.CREATED).json({
			status: 'success',
			...(pessoa.status === 'desaparecida'
				? {
						message:
							'Pessoa com registro de desaparecida localizada automaticamente via check-in.',
					}
				: {}),
			data: {
				id: transactionResult.checkin.id,
				pessoa: {
					id: transactionResult.pessoa.id,
					nome: transactionResult.pessoa.nome,
					status: transactionResult.pessoa.status,
				},
				abrigo: {
					id: transactionResult.abrigo.id,
					nome: transactionResult.abrigo.nome,
				},
				data_entrada: transactionResult.checkin.data_entrada,
			},
		});
	},
);

export const registerCheckinExit = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params as { id: string };
		const checkin = await checkinModel.findById(id);

		if (!checkin) {
			throw new ApiError(
				Constants.HTTP_STATUS.NOT_FOUND,
				'Check-in não encontrado.',
			);
		}

		if (checkin.data_saida) {
			throw new ApiError(
				Constants.HTTP_STATUS.CONFLICT,
				'Check-in já foi encerrado anteriormente.',
			);
		}

		const closedCheckin = await db.withTransaction(async (client) => {
			const registroSaida = await checkinModel.close(client, id);
			if (!registroSaida) {
				throw new ApiError(
					Constants.HTTP_STATUS.CONFLICT,
					'Não foi possível registrar saída do check-in.',
				);
			}

			const pessoaAtualizada = await pessoaModel.updateStatus(
				client,
				registroSaida.pessoa_id,
				'encontrada',
			);
			if (!pessoaAtualizada) {
				throw new ApiError(
					Constants.HTTP_STATUS.NOT_FOUND,
					'Pessoa não encontrada.',
				);
			}

			const abrigoAtualizado = await abrigoModel.incrementVagas(
				client,
				registroSaida.abrigo_id,
			);
			if (!abrigoAtualizado) {
				throw new ApiError(
					Constants.HTTP_STATUS.CONFLICT,
					'Não foi possível atualizar vagas do abrigo no check-out.',
				);
			}

			return registroSaida;
		});

		res.status(Constants.HTTP_STATUS.OK).json({
			status: 'success',
			data: {
				id: closedCheckin.id,
				data_saida: closedCheckin.data_saida,
			},
		});
	},
);
