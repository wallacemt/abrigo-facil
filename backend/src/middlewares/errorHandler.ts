import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';
import ApiError from '@/utils/ApiError';
import { env } from '@/config/env';

const errorHandler = (
	err: Error | ApiError,
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	void next;

	const status = (err as ApiError).statusCode || 500;
	const message = err.message || 'Internal Server Error';

	// Log format depending on environment
	if (!env.IS_PRODUCTION) {
		logger.error({
			msg: `[${status}] ${message}`,
			stack: err.stack,
		});
	} else {
		logger.error(`[${status}] ${message}`);
	}

	const payload: {
		status: 'error';
		message: string;
		errors?: unknown;
	} = {
		status: 'error',
		message,
	};

	if (Array.isArray((err as { errors?: unknown }).errors)) {
		payload.errors = (err as { errors?: unknown }).errors;
	}

	res.status(status).json(payload);
};

export default errorHandler;
