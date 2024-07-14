import { FastifyError } from 'fastify';
import { instanceOfFastifyError } from './fastifyError';
import { FastifyJwtError, JwtErrorsEnum } from '../types/jwt.types';

export const instanceOfJwtAssertionError = (error: unknown): error is FastifyJwtError => {
	return instanceOfFastifyError(error) && (error as FastifyError).code === JwtErrorsEnum.ERR_ASSERTION;
};

export const instanceOfJwtBadRequestError = (error: unknown): error is FastifyJwtError => {
	return instanceOfFastifyError(error) && (error as FastifyError).code === JwtErrorsEnum.FST_JWT_BAD_REQUEST;
};

export const instanceOfJwtBadCookieRequestError = (error: unknown): error is FastifyJwtError => {
	return instanceOfFastifyError(error) && (error as FastifyError).code === JwtErrorsEnum.FST_JWT_BAD_COOKIE_REQUEST;
};

export const instanceOfJwtNoAuthorizationInHeaderError = (error: unknown): error is FastifyJwtError => {
	return (
		instanceOfFastifyError(error) &&
		(error as FastifyError).code === JwtErrorsEnum.FST_JWT_NO_AUTHORIZATION_IN_HEADER
	);
};

export const instanceOfJwtNoAuthorizationInCookieError = (error: unknown): error is FastifyJwtError => {
	return (
		instanceOfFastifyError(error) &&
		(error as FastifyError).code === JwtErrorsEnum.FST_JWT_NO_AUTHORIZATION_IN_COOKIE
	);
};

export const instanceOfJwtAuthorizationTokenExpiredError = (error: unknown): error is FastifyJwtError => {
	return (
		instanceOfFastifyError(error) &&
		(error as FastifyError).code === JwtErrorsEnum.FST_JWT_AUTHORIZATION_TOKEN_EXPIRED
	);
};

export const instanceOfJwtAuthorizationTokenInvalidError = (error: unknown): error is FastifyJwtError => {
	return (
		instanceOfFastifyError(error) &&
		(error as FastifyError).code === JwtErrorsEnum.FST_JWT_AUTHORIZATION_TOKEN_INVALID
	);
};

export const instanceOfJwtAuthorizationTokenUntrustedError = (error: unknown): error is FastifyJwtError => {
	return (
		instanceOfFastifyError(error) &&
		(error as FastifyError).code === JwtErrorsEnum.FST_JWT_AUTHORIZATION_TOKEN_UNTRUSTED
	);
};

export const instanceOfJwtMissingSignatureError = (error: unknown): error is FastifyJwtError => {
	return instanceOfFastifyError(error) && (error as FastifyError).code === JwtErrorsEnum.FAST_JWT_MISSING_SIGNATURE;
};

export const instanceOfFastifyJwtError = (error: unknown): error is FastifyJwtError => {
	return (
		instanceOfFastifyError(error) &&
		(instanceOfJwtAssertionError(error) ||
			instanceOfJwtBadRequestError(error) ||
			instanceOfJwtBadCookieRequestError(error) ||
			instanceOfJwtNoAuthorizationInHeaderError(error) ||
			instanceOfJwtNoAuthorizationInCookieError(error) ||
			instanceOfJwtAuthorizationTokenExpiredError(error) ||
			instanceOfJwtAuthorizationTokenInvalidError(error) ||
			instanceOfJwtAuthorizationTokenUntrustedError(error) ||
			instanceOfJwtMissingSignatureError(error))
	);
};
