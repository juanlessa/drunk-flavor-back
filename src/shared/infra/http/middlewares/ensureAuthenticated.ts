import auth from '@config/auth';
import AppError from '@errors/AppError';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authenticationErrors';
import { USER_ERRORS } from '@modules/accounts/errors/userErrors';
import { UsersRepository } from '@modules/accounts/infra/prisma/repositories/UsersRepository';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/JsonwebtokenProvider';
import { NextFunction, Request, Response } from 'express';

export async function ensureAuthenticated(request: Request, response: Response, next: NextFunction) {
	const authHeader = request.headers.authorization;
	if (!authHeader) {
		throw new AppError(AUTHENTICATION_ERRORS.missing_token, 401);
	}

	const [, token] = authHeader.split(' ');

	try {
		const jsonwebtokenProvider = new JsonwebtokenProvider();

		const { sub: user_id } = jsonwebtokenProvider.verifyToken({ token, secret: auth.secret_token });

		const usersRepository = new UsersRepository();

		const user = await usersRepository.findById(user_id);
		if (!user) {
			throw new AppError(USER_ERRORS.not_exist, 401);
		}

		request.user = {
			id: user_id
		};

		next();
	} catch {
		throw new AppError(AUTHENTICATION_ERRORS.invalid_token, 401);
	}
}
