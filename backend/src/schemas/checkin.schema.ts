import { z } from 'zod';

export const createCheckinSchema = z.object({
	pessoa_id: z.string().uuid(),
	abrigo_id: z.string().uuid(),
});

export const checkinIdParamSchema = z.object({
	id: z.string().uuid(),
});

export type CreateCheckinInput = z.infer<typeof createCheckinSchema>;
