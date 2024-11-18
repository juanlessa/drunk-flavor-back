import { FastifyJWT } from '@fastify/jwt';
import { DecodedToken } from '../types/jwt.types';
import { FastifyRequest } from 'fastify';
import { AUTH_SESSION } from '../constants/session.constants';
import { logger } from '@/shared/logger';
import { NotFoundError } from '@/shared/error/error.lib';

export const mapDecodedTokenToUser = (user: string | object | Buffer): FastifyJWT['user'] => {
	const { sub, role } = user as DecodedToken;
	return { id: sub, role };
};

export const retrieveRefreshTokenFromSession = (request: FastifyRequest) => {
	const session = request.session.get(AUTH_SESSION);

	if (!session) {
		logger.info(
			`fastify.retrieveRefreshTokenFromSession: session not found for renew token, for ${request.routeOptions.url}`,
		);
		throw new NotFoundError('apiResponses.auth.invalidResource', {
			cause: 'no session found',
			path: 'fastify.retrieveRefreshTokenFromSession',
		});
	}

	return session.refreshToken;
};
