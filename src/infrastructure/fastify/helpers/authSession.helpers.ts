import { FastifyReply, FastifyRequest } from 'fastify';
import { User } from '@/core/accounts/entities/user.entity';
import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from '../constants/cookie.constants';
import { AUTH_SESSION } from '../constants/session.constants';
import { toJwtUserPayload } from './jwt.helpers';

type AuthenticationSessionUser = Pick<User, 'id' | 'role' | 'status' | 'sessionVersion'>;

type RotateAuthenticationSessionOptions = {
	clearRecentAuthentication?: boolean;
};

export const rotateAuthenticationSession = async (
	request: FastifyRequest,
	reply: FastifyReply,
	user: AuthenticationSessionUser,
	options: RotateAuthenticationSessionOptions = {},
): Promise<void> => {
	const tokenPayload = toJwtUserPayload(user);
	const accessToken = await reply.jwtSign(tokenPayload, { sign: { sub: user.id } });
	reply.setCookie(AUTH_COOKIE, accessToken, AUTH_COOKIE_OPTIONS);

	const session = request.session.get(AUTH_SESSION);
	if (!session) {
		return;
	}

	const refreshToken = await reply.sessionJwtSign(tokenPayload, { sign: { sub: user.id } });
	const {
		authenticatedAt: _authenticatedAt,
		reauthenticatedAt: _reauthenticatedAt,
		reauthenticationMethod: _reauthenticationMethod,
		...sessionWithoutRecentAuthentication
	} = session;
	const retainedSession = options.clearRecentAuthentication === false ? session : sessionWithoutRecentAuthentication;

	request.session.set(AUTH_SESSION, {
		...retainedSession,
		refreshToken,
		userRole: user.role,
		userStatus: user.status,
		sessionVersion: user.sessionVersion,
	});
};
