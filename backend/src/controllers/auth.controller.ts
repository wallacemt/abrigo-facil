import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { LoginInput, RegisterInput } from '@/schemas/auth.schema';
import { Constants } from '@/config/constants';
import { authService } from '@/services/auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
	const input = (req.validated?.body ?? req.body) as RegisterInput;
	const user = await authService.register(input);

	res.status(Constants.HTTP_STATUS.CREATED).json({
		status: 'success',
		data: user,
	});
});

export const login = asyncHandler(async (req: Request, res: Response) => {
	const input = (req.validated?.body ?? req.body) as LoginInput;
	const data = await authService.login(input);

	res.status(Constants.HTTP_STATUS.OK).json({
		status: 'success',
		data,
	});
});
