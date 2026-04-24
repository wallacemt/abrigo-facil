import { QueryExecutor, db } from '@/config/database';

export interface Abrigo {
	id: string;
	nome: string;
	codigo_checkin: string;
	endereco: string;
	latitude: number;
	longitude: number;
	capacidade_total: number;
	vagas_disponiveis: number;
	ativo: boolean;
	distancia_km?: number;
}

interface CreateAbrigoInput {
	nome: string;
	endereco: string;
	latitude: number;
	longitude: number;
	capacidade_total: number;
}

interface ListAbrigosFilters {
	lat?: number;
	lng?: number;
	apenasComVagas?: boolean;
}

interface PessoaNoAbrigo {
	id: string;
	nome: string;
	data_entrada: string;
}

interface AbrigoDetails extends Abrigo {
	pessoas: PessoaNoAbrigo[];
}

const distanceExpression = (latIndex: number, lngIndex: number): string => `
	(6371 * acos(
		LEAST(1, GREATEST(-1,
			cos(radians($${latIndex})) *
			cos(radians(a.latitude::float8)) *
			cos(radians(a.longitude::float8) - radians($${lngIndex})) +
			sin(radians($${latIndex})) *
			sin(radians(a.latitude::float8))
		))
	))
`;

export const abrigoModel = {
	async list(filters: ListAbrigosFilters): Promise<Abrigo[]> {
		const whereClauses: string[] = ['a.ativo = true'];
		const values: unknown[] = [];
		let distanceSelect = '';
		let orderBy = 'ORDER BY a.nome ASC';

		if (filters.apenasComVagas) {
			whereClauses.push('a.vagas_disponiveis > 0');
		}

		if (filters.lat !== undefined && filters.lng !== undefined) {
			values.push(filters.lat);
			const latIndex = values.length;
			values.push(filters.lng);
			const lngIndex = values.length;

			const distanceSql = distanceExpression(latIndex, lngIndex);
			distanceSelect = `, ${distanceSql} AS distancia_km`;
			orderBy = 'ORDER BY distancia_km ASC';
		}

		const result = await db.query<Abrigo>(
			`SELECT
				a.id,
				a.nome,
				a.codigo_checkin,
				a.endereco,
				a.latitude::float8 AS latitude,
				a.longitude::float8 AS longitude,
				a.capacidade_total,
				a.vagas_disponiveis,
				a.ativo
				${distanceSelect}
			 FROM abrigos a
			 WHERE ${whereClauses.join(' AND ')}
			 ${orderBy}`,
			values,
		);

		return result.rows;
	},

	async findById(id: string): Promise<Abrigo | null> {
		const result = await db.query<Abrigo>(
			`SELECT
				id,
				nome,
				codigo_checkin,
				endereco,
				latitude::float8 AS latitude,
				longitude::float8 AS longitude,
				capacidade_total,
				vagas_disponiveis,
				ativo
			 FROM abrigos
			 WHERE id = $1
			 LIMIT 1`,
			[id],
		);

		return result.rows[0] ?? null;
	},

	async findByCodigo(codigo: string): Promise<Abrigo | null> {
		const result = await db.query<Abrigo>(
			`SELECT
				id,
				nome,
				codigo_checkin,
				endereco,
				latitude::float8 AS latitude,
				longitude::float8 AS longitude,
				capacidade_total,
				vagas_disponiveis,
				ativo
			 FROM abrigos
			 WHERE codigo_checkin = $1
			 LIMIT 1`,
			[codigo.toUpperCase()],
		);

		return result.rows[0] ?? null;
	},

	async getDetails(id: string): Promise<AbrigoDetails | null> {
		const abrigo = await this.findById(id);
		if (!abrigo) {
			return null;
		}

		const peopleResult = await db.query<PessoaNoAbrigo>(
			`SELECT
				p.id,
				p.nome,
				c.data_entrada::text AS data_entrada
			 FROM checkins c
			 INNER JOIN pessoas p ON p.id = c.pessoa_id
			 WHERE c.abrigo_id = $1
			   AND c.data_saida IS NULL
			 ORDER BY c.data_entrada DESC`,
			[id],
		);

		return {
			...abrigo,
			pessoas: peopleResult.rows,
		};
	},

	async create(
		input: CreateAbrigoInput,
	): Promise<
		Pick<Abrigo, 'id' | 'nome' | 'vagas_disponiveis' | 'codigo_checkin'>
	> {
		const result = await db.query<
			Pick<Abrigo, 'id' | 'nome' | 'vagas_disponiveis' | 'codigo_checkin'>
		>(
			`INSERT INTO abrigos
				(nome, endereco, latitude, longitude, capacidade_total, vagas_disponiveis, codigo_checkin)
			 VALUES (
			 	$1,
			 	$2,
			 	$3,
			 	$4,
			 	$5,
			 	$5,
			 	UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 3) || '-' || SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 3))
			 )
			 RETURNING id, nome, vagas_disponiveis, codigo_checkin`,
			[
				input.nome,
				input.endereco,
				input.latitude,
				input.longitude,
				input.capacidade_total,
			],
		);

		return result.rows[0];
	},

	async updateVagas(
		id: string,
		vagasDisponiveis: number,
	): Promise<Pick<Abrigo, 'id' | 'vagas_disponiveis'> | null> {
		const result = await db.query<Pick<Abrigo, 'id' | 'vagas_disponiveis'>>(
			`UPDATE abrigos
			 SET vagas_disponiveis = $2
			 WHERE id = $1
			   AND ativo = true
			   AND $2 <= capacidade_total
			 RETURNING id, vagas_disponiveis`,
			[id, vagasDisponiveis],
		);

		return result.rows[0] ?? null;
	},

	async deactivate(id: string): Promise<boolean> {
		const result = await db.query<{ id: string }>(
			`UPDATE abrigos
			 SET ativo = false
			 WHERE id = $1
			 RETURNING id`,
			[id],
		);

		return (result.rowCount ?? 0) > 0;
	},

	async decrementVagas(
		executor: QueryExecutor,
		abrigoId: string,
	): Promise<Pick<Abrigo, 'id' | 'nome' | 'vagas_disponiveis'> | null> {
		const result = await executor.query<
			Pick<Abrigo, 'id' | 'nome' | 'vagas_disponiveis'>
		>(
			`UPDATE abrigos
			 SET vagas_disponiveis = vagas_disponiveis - 1
			 WHERE id = $1
			   AND ativo = true
			   AND vagas_disponiveis > 0
			 RETURNING id, nome, vagas_disponiveis`,
			[abrigoId],
		);

		return result.rows[0] ?? null;
	},

	async incrementVagas(
		executor: QueryExecutor,
		abrigoId: string,
	): Promise<Pick<Abrigo, 'id' | 'nome' | 'vagas_disponiveis'> | null> {
		const result = await executor.query<
			Pick<Abrigo, 'id' | 'nome' | 'vagas_disponiveis'>
		>(
			`UPDATE abrigos
			 SET vagas_disponiveis = vagas_disponiveis + 1
			 WHERE id = $1
			   AND vagas_disponiveis < capacidade_total
			 RETURNING id, nome, vagas_disponiveis`,
			[abrigoId],
		);

		return result.rows[0] ?? null;
	},
};
