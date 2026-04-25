import 'dotenv/config';
import argon2 from 'argon2';
import { db, closeDatabasePool } from '@/config/database';

type SeedUser = {
	id: string;
	nome: string;
	email: string;
	perfil: 'voluntario' | 'coordenador';
	senha: string;
};

type SeedAbrigo = {
	id: string;
	nome: string;
	endereco: string;
	latitude: number;
	longitude: number;
	capacidade_total: number;
	vagas_disponiveis: number;
	ativo: boolean;
	codigo_checkin: string;
};

type SeedPessoa = {
	id: string;
	nome: string;
	descricao: string | null;
	foto_url: string | null;
	status: 'desaparecida' | 'em_abrigo' | 'encontrada';
	contato_buscador: string | null;
};

type SeedCheckin = {
	id: string;
	pessoa_id: string;
	abrigo_id: string;
	usuario_id: string;
	data_entrada: string;
	data_saida: string | null;
};

const seedUsers: SeedUser[] = [
	{
		id: '11111111-1111-4111-8111-111111111111',
		nome: 'Coordenadora Maria',
		email: 'coordenadora@abrigofacil.local',
		perfil: 'coordenador',
		senha: 'Abc@123456',
	},
	{
		id: '22222222-2222-4222-8222-222222222222',
		nome: 'Voluntario Joao',
		email: 'voluntario@abrigofacil.local',
		perfil: 'voluntario',
		senha: 'Abc@123456',
	},
];

const seedAbrigos: SeedAbrigo[] = [
	{
		id: 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
		nome: 'Ginasio Municipal Centro',
		endereco: 'Rua das Flores, 100 - Centro',
		latitude: -30.0346,
		longitude: -51.2177,
		capacidade_total: 120,
		vagas_disponiveis: 118,
		ativo: true,
		codigo_checkin: 'ABC-101',
	},
	{
		id: 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
		nome: 'Escola Estadual Sao Jose',
		endereco: 'Avenida Brasil, 450 - Sao Jose',
		latitude: -30.0208,
		longitude: -51.2075,
		capacidade_total: 80,
		vagas_disponiveis: 79,
		ativo: true,
		codigo_checkin: 'ABC-102',
	},
	{
		id: 'aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
		nome: 'Paroquia Santa Luzia',
		endereco: 'Rua Bento, 77 - Navegantes',
		latitude: -29.9989,
		longitude: -51.187,
		capacidade_total: 60,
		vagas_disponiveis: 60,
		ativo: true,
		codigo_checkin: 'ABC-103',
	},
	{
		id: 'aaaaaaa4-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
		nome: 'Centro Comunitario Esperanca',
		endereco: 'Rua Horizonte, 900 - Zona Norte',
		latitude: -30.0123,
		longitude: -51.1654,
		capacidade_total: 50,
		vagas_disponiveis: 50,
		ativo: false,
		codigo_checkin: 'ABC-104',
	},
];

const seedPessoas: SeedPessoa[] = [
	{
		id: 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
		nome: 'Ana Souza',
		descricao: 'Encontrada no bairro Centro.',
		foto_url: null,
		status: 'em_abrigo',
		contato_buscador: 'familia.ana@example.com',
	},
	{
		id: 'bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
		nome: 'Carlos Lima',
		descricao: 'Chegou com a familia no abrigo.',
		foto_url: null,
		status: 'em_abrigo',
		contato_buscador: 'familia.carlos@example.com',
	},
	{
		id: 'bbbbbbb3-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
		nome: 'Lucia Ferreira',
		descricao: 'Foi localizada e ja saiu do abrigo.',
		foto_url: null,
		status: 'encontrada',
		contato_buscador: 'familia.lucia@example.com',
	},
	{
		id: 'bbbbbbb4-bbbb-4bbb-8bbb-bbbbbbbbbbb4',
		nome: 'Paulo Mendes',
		descricao: 'Busca em andamento.',
		foto_url: null,
		status: 'desaparecida',
		contato_buscador: 'familia.paulo@example.com',
	},
	{
		id: 'bbbbbbb5-bbbb-4bbb-8bbb-bbbbbbbbbbb5',
		nome: 'Marina Alves',
		descricao: 'Sem informacoes recentes.',
		foto_url: null,
		status: 'desaparecida',
		contato_buscador: 'familia.marina@example.com',
	},
	{
		id: 'bbbbbbb6-bbbb-4bbb-8bbb-bbbbbbbbbbb6',
		nome: 'Pedro Rocha',
		descricao: 'Foi atendido no abrigo escolar.',
		foto_url: null,
		status: 'encontrada',
		contato_buscador: 'familia.pedro@example.com',
	},
];

const seedCheckins: SeedCheckin[] = [
	{
		id: 'ccccccc1-cccc-4ccc-8ccc-ccccccccccc1',
		pessoa_id: 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
		abrigo_id: 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
		usuario_id: '11111111-1111-4111-8111-111111111111',
		data_entrada: '2026-04-20T09:10:00Z',
		data_saida: null,
	},
	{
		id: 'ccccccc2-cccc-4ccc-8ccc-ccccccccccc2',
		pessoa_id: 'bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
		abrigo_id: 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
		usuario_id: '22222222-2222-4222-8222-222222222222',
		data_entrada: '2026-04-20T10:30:00Z',
		data_saida: null,
	},
	{
		id: 'ccccccc3-cccc-4ccc-8ccc-ccccccccccc3',
		pessoa_id: 'bbbbbbb3-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
		abrigo_id: 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
		usuario_id: '11111111-1111-4111-8111-111111111111',
		data_entrada: '2026-04-18T08:00:00Z',
		data_saida: '2026-04-19T14:45:00Z',
	},
	{
		id: 'ccccccc4-cccc-4ccc-8ccc-ccccccccccc4',
		pessoa_id: 'bbbbbbb6-bbbb-4bbb-8bbb-bbbbbbbbbbb6',
		abrigo_id: 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
		usuario_id: '22222222-2222-4222-8222-222222222222',
		data_entrada: '2026-04-18T13:20:00Z',
		data_saida: '2026-04-20T08:15:00Z',
	},
];

const upsertUsuarios = async (): Promise<void> => {
	for (const user of seedUsers) {
		const senhaHash = await argon2.hash(user.senha);

		await db.query(
			`
			INSERT INTO usuarios (id, nome, email, senha_hash, perfil)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (id) DO UPDATE
			SET nome = EXCLUDED.nome,
				email = EXCLUDED.email,
				senha_hash = EXCLUDED.senha_hash,
				perfil = EXCLUDED.perfil
		`,
			[user.id, user.nome, user.email, senhaHash, user.perfil],
		);
	}
};

const upsertAbrigos = async (): Promise<void> => {
	for (const abrigo of seedAbrigos) {
		await db.query(
			`
			INSERT INTO abrigos (
				id,
				nome,
				endereco,
				latitude,
				longitude,
				capacidade_total,
				vagas_disponiveis,
				ativo,
				codigo_checkin
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
			ON CONFLICT (id) DO UPDATE
			SET nome = EXCLUDED.nome,
				endereco = EXCLUDED.endereco,
				latitude = EXCLUDED.latitude,
				longitude = EXCLUDED.longitude,
				capacidade_total = EXCLUDED.capacidade_total,
				vagas_disponiveis = EXCLUDED.vagas_disponiveis,
				ativo = EXCLUDED.ativo,
				codigo_checkin = EXCLUDED.codigo_checkin
		`,
			[
				abrigo.id,
				abrigo.nome,
				abrigo.endereco,
				abrigo.latitude,
				abrigo.longitude,
				abrigo.capacidade_total,
				abrigo.vagas_disponiveis,
				abrigo.ativo,
				abrigo.codigo_checkin,
			],
		);
	}
};

const upsertPessoas = async (): Promise<void> => {
	for (const pessoa of seedPessoas) {
		await db.query(
			`
			INSERT INTO pessoas (
				id,
				nome,
				descricao,
				foto_url,
				status,
				contato_buscador
			)
			VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT (id) DO UPDATE
			SET nome = EXCLUDED.nome,
				descricao = EXCLUDED.descricao,
				foto_url = EXCLUDED.foto_url,
				status = EXCLUDED.status,
				contato_buscador = EXCLUDED.contato_buscador
		`,
			[
				pessoa.id,
				pessoa.nome,
				pessoa.descricao,
				pessoa.foto_url,
				pessoa.status,
				pessoa.contato_buscador,
			],
		);
	}
};

const upsertCheckins = async (): Promise<void> => {
	for (const checkin of seedCheckins) {
		await db.query(
			`
			INSERT INTO checkins (
				id,
				pessoa_id,
				abrigo_id,
				usuario_id,
				data_entrada,
				data_saida
			)
			VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT (id) DO UPDATE
			SET pessoa_id = EXCLUDED.pessoa_id,
				abrigo_id = EXCLUDED.abrigo_id,
				usuario_id = EXCLUDED.usuario_id,
				data_entrada = EXCLUDED.data_entrada,
				data_saida = EXCLUDED.data_saida
		`,
			[
				checkin.id,
				checkin.pessoa_id,
				checkin.abrigo_id,
				checkin.usuario_id,
				checkin.data_entrada,
				checkin.data_saida,
			],
		);
	}
};

const recomputeVagasDisponiveis = async (): Promise<void> => {
	await db.query(`
		UPDATE abrigos a
		SET vagas_disponiveis = GREATEST(a.capacidade_total - active.total, 0)
		FROM (
			SELECT abrigo_id, COUNT(*)::int AS total
			FROM checkins
			WHERE data_saida IS NULL
			GROUP BY abrigo_id
		) AS active
		WHERE a.id = active.abrigo_id
	`);

	await db.query(`
		UPDATE abrigos
		SET vagas_disponiveis = capacidade_total
		WHERE id NOT IN (
			SELECT DISTINCT abrigo_id
			FROM checkins
			WHERE data_saida IS NULL
		)
	`);
};

const runSeed = async (): Promise<void> => {
	await db.withTransaction(async () => {
		await upsertUsuarios();
		await upsertAbrigos();
		await upsertPessoas();
		await upsertCheckins();
		await recomputeVagasDisponiveis();
	});
};

const main = async (): Promise<void> => {
	try {
		await runSeed();
		console.log('Seed completed successfully.');
		console.log('Default users:');
		console.log('- coordenadora@abrigofacil.local / Abc@123456');
		console.log('- voluntario@abrigofacil.local / Abc@123456');
	} catch (error) {
		console.error('Seed failed:', error);
		process.exitCode = 1;
	} finally {
		await closeDatabasePool();
	}
};

void main();
