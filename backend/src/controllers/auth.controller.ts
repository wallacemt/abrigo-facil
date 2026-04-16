import { Request, Response } from 'express';
import argon2 from 'argon2';
import jwt, { SignOptions } from 'jsonwebtoken';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { LoginInput, RegisterInput } from '@/schemas/auth.schema';
import { userModel } from '@/models';
import ApiError from '@/utils/ApiError';
import { Constants } from '@/config/constants';
import { env } from '@/config/env';

const hashOptions: argon2.Options & { raw?: false } = {
	type: argon2.argon2id,
	memoryCost: 65536,
	timeCost: 3,
	parallelism: 4,
};

const generateToken = (payload: {
	id: string;
	nome: string;
	email: string;
	perfil: 'voluntario' | 'coordenador';
}): string => {
	const signOptions: SignOptions = {
		expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
	};

	return jwt.sign(payload, env.JWT_SECRET, signOptions);
};

export const register = asyncHandler(async (req: Request, res: Response) => {
	const input = req.body as RegisterInput;

	const existingUser = await userModel.findByEmail(input.email);
	if (existingUser) {
		throw new ApiError(
			Constants.HTTP_STATUS.BAD_REQUEST,
			'E-mail já cadastrado.',
			true,
			[
				{
					field: 'email',
					message: 'Já existe um usuário com este e-mail.',
				},
			],
		);
	}

	const senha_hash = await argon2.hash(input.senha, hashOptions);
	const user = await userModel.create({
		nome: input.nome,
		email: input.email,
		senha_hash,
		perfil: input.perfil,
	});

	res.status(Constants.HTTP_STATUS.CREATED).json({
		status: 'success',
		data: user,
	});
});

export const login = asyncHandler(async (req: Request, res: Response) => {
	const input = req.body as LoginInput;

	const user = await userModel.findByEmail(input.email);
	if (!user) {
		throw new ApiError(
			Constants.HTTP_STATUS.UNAUTHORIZED,
			'Credenciais inválidas.',
		);
	}

	const isValidPassword = await argon2.verify(user.senha_hash, input.senha);
	if (!isValidPassword) {
		throw new ApiError(
			Constants.HTTP_STATUS.UNAUTHORIZED,
			'Credenciais inválidas.',
		);
	}

	const token = generateToken({
		id: user.id,
		nome: user.nome,
		email: user.email,
		perfil: user.perfil,
	});

	res.status(Constants.HTTP_STATUS.OK).json({
		status: 'success',
		data: {
			token,
			usuario: {
				id: user.id,
				nome: user.nome,
				perfil: user.perfil,
			},
		},
	});
});
