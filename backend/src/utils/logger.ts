import pino from 'pino';
import { env } from '@/config/env';

const logger = pino({
	level: env.LOG_LEVEL,
	transport:
		env.IS_PRODUCTION === 'false'
			? {
					target: 'pino-pretty',
					options: {
						colorize: true,
						translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
						ignore: 'pid,hostname',
					},
				}
			: undefined,
});

export default logger;
