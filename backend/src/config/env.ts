import { z } from 'zod';

const envSchema = z
	.object({
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),
		DATABASE_URL: z.string().min(1),
		PORT: z.coerce.number().int().positive().default(3001),
		CORS_ORIGIN: z.string().url().optional(),
		FRONTEND_URL: z.string().url().optional(),
		JWT_SECRET: z.string().min(1),
		JWT_EXPIRES_IN: z.string().min(1).default('7d'),
		SERVER_HOST: z.string().min(1).default('localhost'),
		LOG_LEVEL: z.string().min(1).default('info'),
		IS_PRODUCTION: z
			.enum(['true', 'false'])
			.default('false')
			.transform((value) => value === 'true'),
	})
	.superRefine((data, ctx) => {
		if (!data.CORS_ORIGIN && !data.FRONTEND_URL) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['CORS_ORIGIN'],
				message: 'Either CORS_ORIGIN or FRONTEND_URL must be set.',
			});
		}
	});

const parsedEnv = envSchema.parse(process.env);

export const env = {
	...parsedEnv,
	CORS_ORIGIN: parsedEnv.CORS_ORIGIN ?? parsedEnv.FRONTEND_URL!,
};
