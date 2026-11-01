import { resolveAccountsModule } from '@/core/accounts/public';
import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from '../constants/cookie.constants';
import { Middleware } from '../types/fastify.types';
import { instanceOfFastifyJwtError, instanceOfJwtAuthorizationTokenExpiredError } from '../errors/fastifyJwtError';
import { toJwtUserPayload } from '../helpers/jwt.helpers';
import { signOut } from './signOut';

/**
 * HTTP adapter for session validation: verifies the JWT credentials, renews the access token cookie, and signs
 * out on invalid credentials. Whether the session itself is still valid is decided by the accounts module.
 */
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
		request.user = await resolveAccountsModule().validateOngoingSession({ session: request.user });
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

	const session = await resolveAccountsModule().validateSessionRenewal({ session: request.user });
	request.user = session;
	const newAccessToken = await reply.jwtSign(toJwtUserPayload(session), { sign: { sub: session.id } });
	reply.setCookie(AUTH_COOKIE, newAccessToken, AUTH_COOKIE_OPTIONS);
};
