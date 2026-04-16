import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morganMiddleware from '@/middlewares/morgan.middleware';
import errorHandler from '@/middlewares/errorHandler';
import { notFoundHandler } from '@/middlewares/notFoundHandler';
import { env } from '@/config/env';
import routes from '@/routes';

class App {
	app: Application;

	constructor() {
		this.app = express();
		this.config();
		this.routes();
		this.errorHandling();
	}

	private routes() {
		this.app.use('/api', routes);
		this.app.use('/', (_req, res) => {
			res.redirect('/api/health');
		});
	}

	private config() {
		this.app.disable('x-powered-by');

		// Logging
		this.app.use(morganMiddleware);

		// Security & Performance
		this.app.use(helmet());
		this.app.use(compression());
		this.app.use(
			rateLimit({
				windowMs: 15 * 60 * 1000,
				max: 100,
				standardHeaders: true,
			}),
		);

		// CORS
		this.app.use(
			cors({
				origin: env.CORS_ORIGIN,
				methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
			}),
		);

		// Body Parsing
		this.app.use(express.json({ limit: '10mb' }));
		this.app.use(express.urlencoded({ extended: true }));
	}

	private errorHandling() {
		this.app.use(notFoundHandler);
		this.app.use(errorHandler);
	}
}

export default new App().app;
