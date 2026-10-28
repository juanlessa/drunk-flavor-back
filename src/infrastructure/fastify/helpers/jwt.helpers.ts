import { FastifyJWT } from '@fastify/jwt';
import { DecodedToken } from '../types/jwt.types';
import { FastifyRequest } from 'fastify';
import { AUTH_SESSION } from '../constants/session.constants';
import { logger } from '@/shared/providers/logger';
import { NotFoundError } from '@/shared/error/error.lib';
import { User } from '@/core/accounts/entities/user.entity';

export const toJwtUserPayload = ({
	role,
	status,
	sessionVersion,
}: Pick<User, 'role' | 'status' | 'sessionVersion'>) => ({ role, status, sessionVersion });

export const mapDecodedTokenToUser = (user: string | object | Buffer): FastifyJWT['user'] => {
	const { sub, role, status, sessionVersion } = user as DecodedToken;
	return { id: sub, role, status, sessionVersion };
};

export const retrieveRefreshTokenFromSession = (request: FastifyRequest) => {
	const session = request.session.get(AUTH_SESSION);

	if (!session) {
		logger.warn(
			{ routeUrl: request.routeOptions.url },
			'retrieveRefreshTokenFromSession: session not found for renew token',
		);
		throw new NotFoundError('apiResponses.auth.invalidResource', {
			cause: 'no session found',
			path: 'fastify.retrieveRefreshTokenFromSession',
		});
	}

	return session.refreshToken;
};
