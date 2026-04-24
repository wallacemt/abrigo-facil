import { db } from '@/config/database';
import { abrigoModel, checkinModel, pessoaModel } from '@/models';
import { CreateCheckinInput } from '@/schemas/checkin.schema';
import ApiError from '@/utils/ApiError';
import { Constants } from '@/config/constants';

export const checkinService = {
	async createByCode(input: CreateCheckinInput, usuarioId?: string) {
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

		const abrigoPorCodigo = await abrigoModel.findByCodigo(
			input.codigo_abrigo,
		);
		if (!abrigoPorCodigo) {
			throw new ApiError(
				Constants.HTTP_STATUS.NOT_FOUND,
				'Código de abrigo não encontrado.',
			);
		}

		const transactionResult = await db.withTransaction(async (client) => {
			const abrigo = await abrigoModel.decrementVagas(
				client,
				abrigoPorCodigo.id,
			);
			if (!abrigo) {
				throw new ApiError(
					Constants.HTTP_STATUS.CONFLICT,
					'Abrigo indisponível, lotado ou desativado.',
				);
			}

			const checkin = await checkinModel.create(client, {
				pessoa_id: input.pessoa_id,
				abrigo_id: abrigoPorCodigo.id,
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

		return {
			isRecoveredMissing: pessoa.status === 'desaparecida',
			result: transactionResult,
		};
	},

	async registerExit(checkinId: string) {
		const checkin = await checkinModel.findById(checkinId);

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

		return db.withTransaction(async (client) => {
			const registroSaida = await checkinModel.close(client, checkinId);
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
	},
};
