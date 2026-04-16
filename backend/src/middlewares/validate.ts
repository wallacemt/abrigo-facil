import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';
import ApiError from '@/utils/ApiError';
import { Constants } from '@/config/constants';

type SchemaMap = {
	body?: ZodType;
	query?: ZodType;
	params?: ZodType;
};

const formatZodErrors = (
	error: ZodError,
): Array<{ field: string; message: string }> => {
	return error.issues.map((issue) => ({
		field: issue.path.join('.') || 'request',
		message: issue.message,
	}));
};

export const validate =
	(schemas: SchemaMap) =>
	async (req: Request, res: Response, next: NextFunction) => {
		void res;

		try {
			if (schemas.body) {
				req.body = await schemas.body.parseAsync(req.body);
			}

			if (schemas.query) {
				req.query = (await schemas.query.parseAsync(
					req.query,
				)) as Request['query'];
			}

			if (schemas.params) {
				req.params = (await schemas.params.parseAsync(
					req.params,
				)) as Request['params'];
			}

			next();
		} catch (error) {
			if (error instanceof ZodError) {
				next(
					new ApiError(
						Constants.HTTP_STATUS.BAD_REQUEST,
						'Dados de entrada inválidos.',
						true,
						formatZodErrors(error),
					),
				);
				return;
			}

			next(error);
		}
	};
