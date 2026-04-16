import { env } from '@/config/env';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

const shouldUseSsl = env.NODE_ENV === 'production';

export const DB = new Pool({
	connectionString: env.DATABASE_URL,
	ssl: shouldUseSsl
		? {
				rejectUnauthorized: false,
			}
		: false,
});

export interface QueryExecutor {
	query<T extends QueryResultRow = QueryResultRow>(
		text: string,
		values?: unknown[],
	): Promise<QueryResult<T>>;
}

export const db = {
	query<T extends QueryResultRow = QueryResultRow>(
		text: string,
		values?: unknown[],
	): Promise<QueryResult<T>> {
		return DB.query<T>(text, values);
	},

	async withTransaction<T>(
		callback: (client: PoolClient) => Promise<T>,
	): Promise<T> {
		const client = await DB.connect();

		try {
			await client.query('BEGIN');
			const result = await callback(client);
			await client.query('COMMIT');
			return result;
		} catch (error) {
			await client.query('ROLLBACK');
			throw error;
		} finally {
			client.release();
		}
	},
};

export const closeDatabasePool = async (): Promise<void> => {
	await DB.end();
};
