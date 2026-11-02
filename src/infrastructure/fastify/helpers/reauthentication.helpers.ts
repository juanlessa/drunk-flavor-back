import { FastifyRequest } from 'fastify';
import { AuthenticationMethod } from '../types/session.types';
import { logger } from '@/shared/providers/logger';

export const logReauthenticationSucceeded = (request: FastifyRequest, method: AuthenticationMethod): void => {
	logger.info(
		{ userId: request.user.id, method, requestId: request.id, outcome: 'success' },
		'User reauthentication completed',
	);
};

export const logReauthenticationFailed = (
	request: FastifyRequest,
	method: AuthenticationMethod,
	error: unknown,
): void => {
	logger.warn(
		{
			userId: request.user.id,
			method,
			requestId: request.id,
			outcome: 'failure',
			failure: error instanceof Error ? error.message : 'unknown reauthentication failure',
		},
		'User reauthentication failed',
	);
};
