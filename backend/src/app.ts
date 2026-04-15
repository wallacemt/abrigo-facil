import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morganMiddleware from '@/middlewares/morgan.middleware';
import errorHandler from '@/middlewares/errorHandler';
import { notFoundHandler } from '@/middlewares/notFoundHandler';
import { env } from './config/env';
import { StatusController } from './controllers/status.controller';


class App {
	app: Application;
	constructor() {
		this.app = express();
		this.config();
		this.routes();
	}
	routes() {
		this.app.use('/status', new StatusController().router);
	}
	config() {
		this.app.use(
			cors({
				origin: env.FRONTEND_URL,
				methods: ['GET', 'POST', 'PUT', 'DELETE'],
			}),
		);
		// this.app.use(requestLogger);
		this.app.use(express.json());

		// Error Handling
		this.app.use(notFoundHandler);
		this.app.use(errorHandler);

		// Body Parsing
		this.app.use(express.json({ limit: '10mb' }));
		this.app.use(express.urlencoded({ extended: true }));

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
	}
}

export default new App().app;
