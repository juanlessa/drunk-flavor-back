import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from '../constants/cookie.constants';
import { Middleware } from '../types/fastify.types';
import { instanceOfFastifyJwtError, instanceOfJwtAuthorizationTokenExpiredError } from '../errors/fastifyJwtError';
import { signOut } from './signOut';
import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';

export const verifyAndRenewToken: Middleware = async (request, reply) => {
	// verify access token
	try {
		await request.jwtVerify();
		return;
	} catch (error) {
		if (!instanceOfJwtAuthorizationTokenExpiredError(error)) {
			void signOut(request, reply);
			throw error;
		}
	}

	// verify refresh token to renew expired access token
	try {
		await request.sessionJwtVerify();
	} catch (error) {
		if (instanceOfFastifyJwtError(error)) {
			void signOut(request, reply);
		}
		throw error;
	}

	// verify user
	const { id } = request.user;

	const usersRepository = resolveUsersRepository();
	const user = await usersRepository.findById(id);
	if (!user) {
		throw new NotFoundError('apiResponses.users.notExist', { path: 'verifyAndRenewToken.middleware' });
	}

	// An `incomplete_profile` user is not `active`, but must still be able to reach
	// the profile routes to complete their profile. Allow both; the profile gate
	// (enforceCompleteProfile) blocks incomplete users from business routes.
	if (user.status !== UserStatuses.active && user.status !== UserStatuses.incomplete_profile) {
		throw new BadRequestError('apiResponses.auth.inactiveAccount', { path: 'verifyAndRenewToken.middleware' });
	}

	// new access token
	const newAccessToken = await reply.jwtSign({ role: user.role, status: user.status }, { sign: { sub: id } });
	reply.setCookie(AUTH_COOKIE, newAccessToken, AUTH_COOKIE_OPTIONS);
};
