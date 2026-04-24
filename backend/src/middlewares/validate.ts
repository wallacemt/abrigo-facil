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
			const validated = req.validated ?? {};

			if (schemas.body) {
				validated.body = await schemas.body.parseAsync(req.body);
				req.body = validated.body;
			}

			if (schemas.query) {
				validated.query = await schemas.query.parseAsync(req.query);
			}

			if (schemas.params) {
				validated.params = await schemas.params.parseAsync(req.params);
			}

			req.validated = validated;

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
