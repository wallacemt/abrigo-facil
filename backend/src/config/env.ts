import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'test', 'production'])
		.default('development'),
	DATABASE_URL: z.string().min(1),
	PORT: z.string().min(1),
	FRONTEND_URL: z.string().min(1),
	JWT_SECRET: z.string().min(1),
	SERVER_HOST: z.string().min(1),
	LOG_LEVEL: z.string().min(1),
	IS_PRODUCTION: z.string().min(1).default('false'),
});

export const env = envSchema.parse(process.env);
