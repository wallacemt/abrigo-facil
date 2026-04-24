import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ApiError from '@/utils/ApiError';
import { Constants } from '@/config/constants';
import { env } from '@/config/env';
import { PerfilUsuario } from '@/models/user.model';

interface AuthTokenPayload extends JwtPayload {
	id: string;
	email: string;
	perfil: PerfilUsuario;
}

const isValidPayload = (
	payload: JwtPayload | string,
): payload is AuthTokenPayload => {
	if (typeof payload === 'string') {
		return false;
	}

	return (
		typeof payload.id === 'string' &&
		typeof payload.email === 'string' &&
		(payload.perfil === 'voluntario' || payload.perfil === 'coordenador')
	);
};

export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	void res;

	const authHeader = req.headers.authorization;
	const token = authHeader?.startsWith('Bearer ')
		? authHeader.split(' ')[1]
		: undefined;

	if (!token) {
		next(
			new ApiError(
				Constants.HTTP_STATUS.UNAUTHORIZED,
				'Token de autenticação não informado.',
			),
		);
		return;
	}

	try {
		const decoded = jwt.verify(token, env.JWT_SECRET);

		if (!isValidPayload(decoded)) {
			throw new ApiError(
				Constants.HTTP_STATUS.UNAUTHORIZED,
				'Token inválido.',
			);
		}

		req.user = {
			id: decoded.id,
			email: decoded.email,
			perfil: decoded.perfil,
			role: decoded.perfil,
		};

		next();
	} catch (error) {
		next(
			error instanceof ApiError
				? error
				: new ApiError(
						Constants.HTTP_STATUS.UNAUTHORIZED,
						'Token inválido ou expirado.',
					),
		);
	}
};

export const authorizeRoles =
	(...allowedRoles: PerfilUsuario[]) =>
	(req: Request, _res: Response, next: NextFunction): void => {
		const userPerfil = req.user?.perfil;

		if (!userPerfil || !allowedRoles.includes(userPerfil)) {
			next(
				new ApiError(
					Constants.HTTP_STATUS.UNAUTHORIZED,
					'Usuário não possui permissão para executar esta ação.',
				),
			);
			return;
		}

		next();
	};
