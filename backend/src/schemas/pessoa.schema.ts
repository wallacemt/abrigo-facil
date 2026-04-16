import { z } from 'zod';

export const createPessoaSchema = z.object({
	nome: z.string().min(2).max(255),
	descricao: z.string().max(1000).optional(),
	foto_url: z.string().url().optional(),
	contato_buscador: z.string().max(255).optional(),
});

export const buscarPessoaSchema = z.object({
	nome: z.string().min(2).max(255),
});

export type CreatePessoaInput = z.infer<typeof createPessoaSchema>;
export type BuscarPessoaQuery = z.infer<typeof buscarPessoaSchema>;
