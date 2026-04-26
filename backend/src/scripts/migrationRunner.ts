// migrationsRunner.ts
import { db } from '@/config/database';
import { readdir } from 'fs/promises';
import path from 'path';

const MIGRATIONS_DIR = path.resolve(__dirname, '../migrations'); // pasta das migrations

export async function runMigrations(): Promise<void> {
	// Cria tabela para controlar migrations aplicadas
	await db.query(`
		CREATE TABLE IF NOT EXISTS migrations_applied (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) UNIQUE NOT NULL,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`);

	// Lê todas as migrations da pasta
	const files = await readdir(MIGRATIONS_DIR);
	const sqlFiles = files.filter((f) => f.endsWith('.sql')).sort();

	for (const file of sqlFiles) {
		// Verifica se a migration já foi aplicada
		const { rowCount } = await db.query(
			`SELECT 1 FROM migrations_applied WHERE name = $1`,
			[file],
		);

		if (rowCount && rowCount > 0) {
			console.log(`Migration ${file} já aplicada, pulando...`);
			continue;
		}

		// Lê o conteúdo da migration
		const filePath = path.join(MIGRATIONS_DIR, file);
		const sql = await (await import('fs/promises')).readFile(filePath, 'utf-8');

		// Executa a migration dentro de uma transação
		await db.withTransaction(async (client) => {
			await client.query(sql);
			await client.query(
				`INSERT INTO migrations_applied (name) VALUES ($1)`,
				[file],
			);
		});

		console.log(`Migration ${file} aplicada com sucesso!`);
	}
}

// Exemplo de execução direta
if (require.main === module) {
	runMigrations().catch((err) => {
		console.error('Erro ao rodar migrations:', err);
		process.exit(1);
	});
}
