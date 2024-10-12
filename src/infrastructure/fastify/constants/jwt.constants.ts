import { env } from '@/env';
import { FastifyJWTOptions, SignOptions, VerifyOptions } from '@fastify/jwt';
import { AUTH_COOKIE } from './cookie.constants';
import { mapDecodedTokenToUser, retrieveRefreshTokenFromSession } from '../helpers/jwt.helpers';
import { LocaleKey } from '@/shared/types/locale.types';

const CUSTOM_MESSAGES = {
	badRequestErrorMessage: 'apiResponses.auth.badRequestErrorMessage',
	badCookieRequestErrorMessage: 'apiResponses.auth.badCookieRequestErrorMessage',
	noAuthorizationInHeaderMessage: 'apiResponses.auth.noAuthorizationInHeaderMessage',
	noAuthorizationInCookieMessage: 'apiResponses.auth.noAuthorizationInCookieMessage',
	authorizationTokenExpiredMessage: 'apiResponses.auth.authorizationTokenExpiredMessage',
	authorizationTokenUntrusted: 'apiResponses.auth.authorizationTokenUntrusted',
	authorizationTokenUnsigned: 'apiResponses.auth.authorizationTokenUnsigned',
	authorizationTokenInvalid: 'apiResponses.auth.authorizationTokenInvalid',
} satisfies Record<keyof FastifyJWTOptions['messages'], LocaleKey>;

export const TOKEN_SECRET = env.ACCESS_TOKEN_SECRET;
export const TOKEN_SIGN_OPTIONS = {
	expiresIn: env.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
} satisfies Partial<SignOptions>;

export const TOKEN_OPTIONS = {
	secret: TOKEN_SECRET,
	messages: CUSTOM_MESSAGES,
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
	messages: CUSTOM_MESSAGES,
	sign: REFRESH_TOKEN_SIGN_OPTIONS,
	verify: {
		extractToken: retrieveRefreshTokenFromSession,
	},
	formatUser: mapDecodedTokenToUser,
} satisfies FastifyJWTOptions;
