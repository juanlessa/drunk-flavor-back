import auth from '@config/auth';
import AppError from '@shared/errors/AppError';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authentication.errors';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { UsersRepository } from '@modules/accounts/infra/mongo/repositories/Users.repository';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/Jsonwebtoken.provider';
import { AppNextFunction, AppRequest, AppResponse } from '../types';

export async function ensureAuthenticated(request: AppRequest, response: AppResponse, next: AppNextFunction) {
	const authHeader = request.headers.authorization;
	if (!authHeader) {
		throw new AppError(AUTHENTICATION_ERRORS.missing_token, 401);
	}

	const [, token] = authHeader.split(' ');

	try {
		const jwtProvider = new JsonwebtokenProvider();

		const { sub: user_id } = jwtProvider.verifyToken({ token, secret: auth.secret_token });

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
