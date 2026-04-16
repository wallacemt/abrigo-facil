import { z } from 'zod';

export const registerSchema = z.object({
	nome: z.string().min(2).max(255),
	email: z.string().email().max(255),
	senha: z.string().min(8).max(255),
	perfil: z.enum(['voluntario', 'coordenador']),
});

export const loginSchema = z.object({
	email: z.string().email().max(255),
	senha: z.string().min(8).max(255),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
