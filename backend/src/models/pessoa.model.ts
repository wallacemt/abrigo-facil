import { QueryExecutor, db } from '@/config/database';

export type PessoaStatus = 'desaparecida' | 'em_abrigo' | 'encontrada';

export interface Pessoa {
	id: string;
	nome: string;
	descricao: string | null;
	foto_url: string | null;
	status: PessoaStatus;
	contato_buscador: string | null;
}

interface CreatePessoaInput {
	nome: string;
	descricao?: string;
	foto_url?: string;
	contato_buscador?: string;
}

interface SearchRow {
	id: string;
	nome: string;
	status: PessoaStatus;
	checkin_id: string | null;
	abrigo_id: string | null;
	abrigo_nome: string | null;
	abrigo_endereco: string | null;
}

interface PessoaSearchResult {
	id: string;
	nome: string;
	status: PessoaStatus;
	abrigo_atual?: {
		id: string;
		nome: string;
		endereco: string;
	};
}

export const pessoaModel = {
	async create(
		input: CreatePessoaInput,
	): Promise<Pick<Pessoa, 'id' | 'nome' | 'status'>> {
		const result = await db.query<Pick<Pessoa, 'id' | 'nome' | 'status'>>(
			`INSERT INTO pessoas (nome, descricao, foto_url, contato_buscador, status)
			 VALUES ($1, $2, $3, $4, 'desaparecida')
			 RETURNING id, nome, status`,
			[
				input.nome,
				input.descricao ?? null,
				input.foto_url ?? null,
				input.contato_buscador ?? null,
			],
		);

		return result.rows[0];
	},

	async findById(id: string): Promise<Pessoa | null> {
		const result = await db.query<Pessoa>(
			`SELECT id, nome, descricao, foto_url, status, contato_buscador
			 FROM pessoas
			 WHERE id = $1
			 LIMIT 1`,
			[id],
		);

		return result.rows[0] ?? null;
	},

	async searchByName(nome: string): Promise<PessoaSearchResult[]> {
		const result = await db.query<SearchRow>(
			`SELECT
				p.id,
				p.nome,
				p.status,
				c.id AS checkin_id,
				a.id AS abrigo_id,
				a.nome AS abrigo_nome,
				a.endereco AS abrigo_endereco
			 FROM pessoas p
			 LEFT JOIN checkins c
			   ON c.pessoa_id = p.id
			  AND c.data_saida IS NULL
			 LEFT JOIN abrigos a
			   ON a.id = c.abrigo_id
			 WHERE p.nome ILIKE '%' || $1 || '%'
			 ORDER BY p.nome ASC`,
			[nome],
		);

		return result.rows.map((row) => ({
			id: row.id,
			nome: row.nome,
			status: row.status,
			checkin_id: row.checkin_id ?? undefined,
			...(row.abrigo_id && row.abrigo_nome && row.abrigo_endereco
				? {
						abrigo_atual: {
							id: row.abrigo_id,
							nome: row.abrigo_nome,
							endereco: row.abrigo_endereco,
						},
					}
				: {}),
		}));
	},

	async updateStatus(
		executor: QueryExecutor,
		pessoaId: string,
		status: PessoaStatus,
	): Promise<Pick<Pessoa, 'id' | 'nome' | 'status'> | null> {
		const result = await executor.query<
			Pick<Pessoa, 'id' | 'nome' | 'status'>
		>(
			`UPDATE pessoas
			 SET status = $2
			 WHERE id = $1
			 RETURNING id, nome, status`,
			[pessoaId, status],
		);

		return result.rows[0] ?? null;
	},
};
