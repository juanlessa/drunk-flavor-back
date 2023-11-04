import auth from '@config/auth';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authentication.errors';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { UsersRepository } from '@modules/accounts/infra/mongo/repositories/Users.repository';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/Jsonwebtoken.provider';
import { AppNextFunction, AppRequest, AppResponse } from '../types';
import { UnauthorizedError } from '@shared/errors/error.lib';

export async function ensureAuthenticated(request: AppRequest, response: AppResponse, next: AppNextFunction) {
	const authHeader = request.headers.authorization;
	if (!authHeader) {
		throw new UnauthorizedError(AUTHENTICATION_ERRORS.missing_token, { path: 'ensureAuthenticated.middleware' });
	}

	const [, token] = authHeader.split(' ');

	try {
		const jwtProvider = new JsonwebtokenProvider();

		const { sub: user_id } = jwtProvider.verifyToken({ token, secret: auth.secret_token });

		const usersRepository = new UsersRepository();

		const user = await usersRepository.findById(user_id);
		if (!user) {
			throw new UnauthorizedError(USER_ERRORS.not_exist, { path: 'ensureAuthenticated.middleware' });
		}

		request.user = {
			id: user_id
		};

		next();
	} catch {
		throw new UnauthorizedError(AUTHENTICATION_ERRORS.invalid_token, { path: 'ensureAuthenticated.middleware' });
	}
}
