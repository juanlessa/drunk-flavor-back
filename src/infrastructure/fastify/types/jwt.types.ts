import { Role } from '@/shared/accessControl/roles';
import { FastifyError } from 'fastify';

export const JwtErrors = {
	ERR_ASSERTION: 'ERR_ASSERTION',
	FST_JWT_BAD_REQUEST: 'FST_JWT_BAD_REQUEST',
	FST_JWT_BAD_COOKIE_REQUEST: 'FST_JWT_BAD_COOKIE_REQUEST',
	FST_JWT_NO_AUTHORIZATION_IN_HEADER: 'FST_JWT_NO_AUTHORIZATION_IN_HEADER',
	FST_JWT_NO_AUTHORIZATION_IN_COOKIE: 'FST_JWT_NO_AUTHORIZATION_IN_COOKIE',
	FST_JWT_AUTHORIZATION_TOKEN_EXPIRED: 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED',
	FST_JWT_AUTHORIZATION_TOKEN_INVALID: 'FST_JWT_AUTHORIZATION_TOKEN_INVALID',
	FST_JWT_AUTHORIZATION_TOKEN_UNTRUSTED: 'FST_JWT_AUTHORIZATION_TOKEN_UNTRUSTED',
	FAST_JWT_MISSING_SIGNATURE: 'FAST_JWT_MISSING_SIGNATURE',
} as const;

export type JwtError = (typeof JwtErrors)[keyof typeof JwtErrors];

export interface FastifyJwtError extends FastifyError {
	code: JwtError;
	statusCode: number;
}

export type DecodedToken = {
	[key: string]: any;
	sub: string;
	role: Role;
};
