
import app from './app';
import { env } from '@/config/env';
import logger from '@/utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const server = app.listen(env.PORT, () => {
	logger.info(`Server running at http://${env.SERVER_HOST}:${env.PORT}`);
});

const shutdown = (signal: string) => {
	logger.info(`${signal} received. Shutting down gracefully...`);
	server.close(() => {
		logger.info('Server closed.');
		process.exit(0);
	});
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
