import 'express';

declare module 'express' {
	export interface Request {
		user?: {
			id: string;
			email: string;
			perfil: 'voluntario' | 'coordenador';
			role?: 'voluntario' | 'coordenador';
		};
		validated?: {
			body?: unknown;
			query?: unknown;
			params?: unknown;
		};
	}
}
