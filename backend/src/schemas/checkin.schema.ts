import { z } from 'zod';

export const createCheckinSchema = z.object({
	pessoa_id: z.string().uuid(),
	codigo_abrigo: z
		.string()
		.trim()
		.toUpperCase()
		.regex(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/, 'Código de abrigo inválido.'),
});

export const checkinIdParamSchema = z.object({
	id: z.string().uuid(),
});

export type CreateCheckinInput = z.infer<typeof createCheckinSchema>;
