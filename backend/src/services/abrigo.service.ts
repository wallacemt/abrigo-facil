import ApiError from '@/utils/ApiError';
import { Constants } from '@/config/constants';
import { abrigoModel } from '@/models/abrigo.model';
import {
	CreateAbrigoInput,
	ListAbrigoQuery,
	UpdateVagasInput,
} from '@/schemas/abrigo.schema';

export const abrigoService = {
	async list(query: ListAbrigoQuery) {
		return abrigoModel.list({
			lat: query.lat,
			lng: query.lng,
			apenasComVagas: query.apenas_com_vagas,
		});
	},

	async details(id: string) {
		const data = await abrigoModel.getDetails(id);
		if (!data) {
			throw new ApiError(
				Constants.HTTP_STATUS.NOT_FOUND,
				'Abrigo não encontrado.',
			);
		}

		return data;
	},

	async create(input: CreateAbrigoInput, usuarioId: string) {

		return abrigoModel.create({
			...input,
			criado_por_usuario_id: usuarioId,
		});
	},

	async updateVagas(id: string, input: UpdateVagasInput, usuarioId: string) {
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

		if (abrigo.criado_por_usuario_id !== usuarioId) {
			throw new ApiError(
				Constants.HTTP_STATUS.UNAUTHORIZED,
				'Apenas o organizador que criou o abrigo pode alterar seus dados.',
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

		return data;
	},

	async deactivate(id: string, usuarioId: string) {
		const abrigo = await abrigoModel.findById(id);
		if (!abrigo) {
			throw new ApiError(
				Constants.HTTP_STATUS.NOT_FOUND,
				'Abrigo não encontrado.',
			);
		}

		if (abrigo.criado_por_usuario_id !== usuarioId) {
			throw new ApiError(
				Constants.HTTP_STATUS.UNAUTHORIZED,
				'Apenas o organizador que criou o abrigo pode desativá-lo.',
			);
		}

		const success = await abrigoModel.deactivate(id);
		if (!success) {
			throw new ApiError(
				Constants.HTTP_STATUS.NOT_FOUND,
				'Abrigo não encontrado.',
			);
		}
	},
};
