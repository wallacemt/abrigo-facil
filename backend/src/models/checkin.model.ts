import { QueryExecutor, db } from '@/config/database';

export interface Checkin {
	id: string;
	pessoa_id: string;
	abrigo_id: string;
	usuario_id: string | null;
	data_entrada: string;
	data_saida: string | null;
}

interface CreateCheckinInput {
	pessoa_id: string;
	abrigo_id: string;
	usuario_id?: string;
}

export const checkinModel = {
	async findActiveByPessoaId(pessoaId: string): Promise<Checkin | null> {
		const result = await db.query<Checkin>(
			`SELECT
				id,
				pessoa_id,
				abrigo_id,
				usuario_id,
				data_entrada::text AS data_entrada,
				data_saida::text AS data_saida
			 FROM checkins
			 WHERE pessoa_id = $1
			   AND data_saida IS NULL
			 LIMIT 1`,
			[pessoaId],
		);

		return result.rows[0] ?? null;
	},

	async findById(checkinId: string): Promise<Checkin | null> {
		const result = await db.query<Checkin>(
			`SELECT
				id,
				pessoa_id,
				abrigo_id,
				usuario_id,
				data_entrada::text AS data_entrada,
				data_saida::text AS data_saida
			 FROM checkins
			 WHERE id = $1
			 LIMIT 1`,
			[checkinId],
		);

		return result.rows[0] ?? null;
	},

	async create(
		executor: QueryExecutor,
		input: CreateCheckinInput,
	): Promise<Checkin> {
		const result = await executor.query<Checkin>(
			`INSERT INTO checkins (pessoa_id, abrigo_id, usuario_id)
			 VALUES ($1, $2, $3)
			 RETURNING
				id,
				pessoa_id,
				abrigo_id,
				usuario_id,
				data_entrada::text AS data_entrada,
				data_saida::text AS data_saida`,
			[input.pessoa_id, input.abrigo_id, input.usuario_id ?? null],
		);

		return result.rows[0];
	},

	async close(
		executor: QueryExecutor,
		checkinId: string,
	): Promise<Checkin | null> {
		const result = await executor.query<Checkin>(
			`UPDATE checkins
			 SET data_saida = NOW()
			 WHERE id = $1
			   AND data_saida IS NULL
			 RETURNING
				id,
				pessoa_id,
				abrigo_id,
				usuario_id,
				data_entrada::text AS data_entrada,
				data_saida::text AS data_saida`,
			[checkinId],
		);

		return result.rows[0] ?? null;
	},
};
