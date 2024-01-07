import auth from '@config/auth';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authentication.errors';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { AppNextFunction, AppRequest, AppResponse } from '../types';
import { UnauthorizedError } from '@shared/errors/error.lib';
import { resolveJwtProvider } from '@shared/container/providers/jwt';
import { resolveUsersRepository } from '@modules/accounts/container';

export async function ensureAuthenticated(request: AppRequest, _response: AppResponse, next: AppNextFunction) {
	const accessToken = request.cookies.authorization as string | undefined;

	if (!accessToken) {
		throw new UnauthorizedError(AUTHENTICATION_ERRORS.missing_token, { path: 'ensureAuthenticated.middleware' });
	}

	try {
		const jwtProvider = resolveJwtProvider();

		const { sub: user_id } = jwtProvider.verifyToken({ token: accessToken, secret: auth.secret_token });

		const usersRepository = resolveUsersRepository();

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
