import { db } from '@/config/database';

export type PerfilUsuario = 'voluntario' | 'coordenador';

export interface User {
	id: string;
	nome: string;
	email: string;
	perfil: PerfilUsuario;
}

export interface UserWithPassword extends User {
	senha_hash: string;
}

interface CreateUserInput {
	nome: string;
	email: string;
	senha_hash: string;
	perfil: PerfilUsuario;
}

export const userModel = {
	async findByEmail(email: string): Promise<UserWithPassword | null> {
		const result = await db.query<UserWithPassword>(
			`SELECT id, nome, email, perfil, senha_hash
			 FROM usuarios
			 WHERE email = $1
			 LIMIT 1`,
			[email],
		);

		return result.rows[0] ?? null;
	},

	async create(input: CreateUserInput): Promise<User> {
		const result = await db.query<User>(
			`INSERT INTO usuarios (nome, email, senha_hash, perfil)
			 VALUES ($1, $2, $3, $4)
			 RETURNING id, nome, email, perfil`,
			[input.nome, input.email, input.senha_hash, input.perfil],
		);

		return result.rows[0];
	},
};
