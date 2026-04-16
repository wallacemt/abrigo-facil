import { z } from 'zod';

const queryBoolean = z.preprocess((value) => {
	if (value === 'true' || value === true) {
		return true;
	}

	if (value === 'false' || value === false) {
		return false;
	}

	return undefined;
}, z.boolean().optional());

export const abrigoIdParamSchema = z.object({
	id: z.string().uuid(),
});

export const createAbrigoSchema = z.object({
	nome: z.string().min(2).max(255),
	endereco: z.string().min(5),
	latitude: z.coerce.number().min(-90).max(90),
	longitude: z.coerce.number().min(-180).max(180),
	capacidade_total: z.coerce.number().int().positive(),
});

export const listAbrigoQuerySchema = z
	.object({
		lat: z.coerce.number().min(-90).max(90).optional(),
		lng: z.coerce.number().min(-180).max(180).optional(),
		apenas_com_vagas: queryBoolean,
	})
	.superRefine((data, ctx) => {
		if ((data.lat === undefined) !== (data.lng === undefined)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['lat'],
				message: 'lat e lng devem ser informados juntos.',
			});
		}
	});

export const updateVagasSchema = z.object({
	vagas_disponiveis: z.coerce.number().int().min(0),
});

export type CreateAbrigoInput = z.infer<typeof createAbrigoSchema>;
export type ListAbrigoQuery = z.infer<typeof listAbrigoQuerySchema>;
export type UpdateVagasInput = z.infer<typeof updateVagasSchema>;
