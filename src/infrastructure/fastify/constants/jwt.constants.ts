import { env } from '@/env';
import { FastifyJWTOptions, SignOptions, VerifyOptions } from '@fastify/jwt';
import { AUTH_COOKIE } from './cookie.constants';
import { mapDecodedTokenToUser, retrieveRefreshTokenFromSession } from '../helpers/jwt.helpers';

export const TOKEN_SECRET = env.ACCESS_TOKEN_SECRET;
export const TOKEN_SIGN_OPTIONS = {
	expiresIn: env.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
} satisfies Partial<SignOptions>;

export const TOKEN_OPTIONS = {
	secret: TOKEN_SECRET,
	sign: TOKEN_SIGN_OPTIONS,
	formatUser: mapDecodedTokenToUser,
	cookie: {
		cookieName: AUTH_COOKIE,
		signed: true,
	},
} satisfies FastifyJWTOptions;

export const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET;
export const REFRESH_TOKEN_SIGN_OPTIONS = {
	expiresIn: env.REFRESH_TOKEN_EXPIRES_IN_SECONDS,
} satisfies Partial<SignOptions>;

export const REFRESH_TOKEN_OPTIONS = {
	secret: REFRESH_TOKEN_SECRET,
	namespace: 'session',
	sign: REFRESH_TOKEN_SIGN_OPTIONS,
	verify: {
		extractToken: retrieveRefreshTokenFromSession,
	},
	formatUser: mapDecodedTokenToUser,
} satisfies FastifyJWTOptions;
