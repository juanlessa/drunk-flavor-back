import { env } from '@/env';
import { FastifyJWTOptions } from '@fastify/jwt';
import { AUTH_COOKIE } from './cookie.constants';
import { mapDecodedTokenToUser, retrieveRefreshTokenFromSession } from '../helpers/jwt.helpers';

export const TOKEN_OPTIONS = {
	secret: env.TOKEN_SECRET,
	sign: {
		expiresIn: env.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
	},
	formatUser: mapDecodedTokenToUser,
	cookie: {
		cookieName: AUTH_COOKIE,
		signed: true,
	},
} satisfies FastifyJWTOptions;

export const REFRESH_TOKEN_OPTIONS = {
	secret: env.TOKEN_SECRET,
	namespace: 'session',
	sign: {
		expiresIn: env.REFRESH_TOKEN_EXPIRES_IN_SECONDS,
	},
	verify: {
		extractToken: retrieveRefreshTokenFromSession,
	},
	formatUser: mapDecodedTokenToUser,
} satisfies FastifyJWTOptions;
