import 'dotenv/config';
import app from './app';
import { env } from '@/config/env';
import logger from '@/utils/logger';
import { closeDatabasePool } from '@/config/database';

const server = app.listen(env.PORT, () => {
	logger.info(`Server running at http://${env.SERVER_HOST}:${env.PORT}`);
});

let isShuttingDown = false;

const closeHttpServer = (): Promise<void> => {
	return new Promise((resolve, reject) => {
		server.close((error) => {
			if (error) {
				reject(error);
				return;
			}

			resolve();
		});
	});
};

const shutdown = async (signal: string, exitCode = 0): Promise<void> => {
	if (isShuttingDown) {
		logger.warn(`Shutdown already in progress. Ignoring signal ${signal}.`);
		return;
	}

	isShuttingDown = true;
	logger.info(`${signal} received. Shutting down gracefully...`);

	try {
		await closeHttpServer();
		logger.info('HTTP server closed.');

		await closeDatabasePool();
		logger.info('PostgreSQL pool closed.');
	} catch (error) {
		logger.error({
			msg: 'Error during graceful shutdown.',
			error,
		});
		exitCode = 1;
	}

	process.exit(exitCode);
};

process.on('SIGINT', () => {
	void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
	void shutdown('SIGTERM');
});

process.on('uncaughtException', (error) => {
	logger.error({
		msg: 'Uncaught exception detected.',
		error,
	});
	void shutdown('uncaughtException', 1);
});

process.on('unhandledRejection', (reason) => {
	logger.error({
		msg: 'Unhandled promise rejection detected.',
		reason,
	});
	void shutdown('unhandledRejection', 1);
});
