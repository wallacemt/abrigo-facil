import { pessoaModel } from '@/models';
import { BuscarPessoaQuery, CreatePessoaInput } from '@/schemas/pessoa.schema';

export const pessoaService = {
	async create(input: CreatePessoaInput) {
		return pessoaModel.create(input);
	},

	async search(query: BuscarPessoaQuery) {
		return pessoaModel.searchByName(query.nome);
	},
};
