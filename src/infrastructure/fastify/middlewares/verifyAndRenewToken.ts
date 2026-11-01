import { FastifyRequest } from 'fastify';
import { User } from '@/core/accounts/entities/user.entity';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { assertCurrentSessionVersion } from '@/core/accounts/policies/SessionVersion.policy';
import { resolveAccountsModule } from '@/core/accounts/public';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from '../constants/cookie.constants';
import { Middleware } from '../types/fastify.types';
import { instanceOfFastifyJwtError, instanceOfJwtAuthorizationTokenExpiredError } from '../errors/fastifyJwtError';
import { toJwtUserPayload } from '../helpers/jwt.helpers';
import { signOut } from './signOut';

const hasUsableAuthenticatedStatus = (user: User): boolean =>
	user.status === UserStatuses.active || user.status === UserStatuses.incomplete_profile;

const requireCurrentSession = async (request: FastifyRequest, path: string): Promise<User> => {
	const user = await resolveAccountsModule().findUserById(request.user.id);
	if (!user || !hasUsableAuthenticatedStatus(user)) {
		throw new SessionRevokedError({ path, cause: 'The session user is missing or inactive' });
	}

	assertCurrentSessionVersion(user, request.user.sessionVersion, path);
	request.user = {
		id: user.id,
		role: user.role,
		status: user.status,
		sessionVersion: user.sessionVersion,
	};
	return user;
};

export const verifyAndRenewToken: Middleware = async (request, reply) => {
	let accessTokenExpired = false;
	try {
		await request.jwtVerify();
	} catch (error) {
		if (instanceOfJwtAuthorizationTokenExpiredError(error)) {
			accessTokenExpired = true;
		} else {
			if (instanceOfFastifyJwtError(error)) {
				await signOut(request, reply);
			}
			throw error;
		}
	}

	if (!accessTokenExpired) {
		await requireCurrentSession(request, 'verifyAndRenewToken.currentSession');
		return;
	}

	try {
		await request.sessionJwtVerify();
	} catch (error) {
		if (instanceOfFastifyJwtError(error)) {
			await signOut(request, reply);
		}
		throw error;
	}

	const user = await requireCurrentSession(request, 'verifyAndRenewToken.refreshSession');
	const newAccessToken = await reply.jwtSign(toJwtUserPayload(user), { sign: { sub: user.id } });
	reply.setCookie(AUTH_COOKIE, newAccessToken, AUTH_COOKIE_OPTIONS);
};
