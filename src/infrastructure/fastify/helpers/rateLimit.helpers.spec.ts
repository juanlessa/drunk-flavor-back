import { describe, expect, it } from 'vitest';
import type { FastifyRequest } from 'fastify';
import { errorResponseBuilder } from '@/infrastructure/fastify/helpers/rateLimit.helpers';
import { ForbiddenError, TooManyRequestsError } from '@/shared/error/error.lib';
import { HTTP_STATUS } from '@/shared/constants/http.constants';

const LOCALE_KEY = 'apiResponses.auth.tooManyRequests';

const request = {} as FastifyRequest;

describe('errorResponseBuilder', () => {
	it('returns a TooManyRequestsError when ban is false', () => {
		const error = errorResponseBuilder(request, { ban: false, after: '30 seconds' });

		expect(error).toBeInstanceOf(TooManyRequestsError);
		expect(error.message).toBe(LOCALE_KEY);
		expect(error.status).toBe(HTTP_STATUS.too_many_requests);
		expect(error.path).toBe('RateLimit.exceeded');
		expect(error.cause).toBe('rate limit exceeded (retry in 30 seconds)');
	});

	it('returns a ForbiddenError when ban is true', () => {
		const error = errorResponseBuilder(request, { ban: true, after: '1 hour' });

		expect(error).toBeInstanceOf(ForbiddenError);
		expect(error.message).toBe(LOCALE_KEY);
		expect(error.status).toBe(HTTP_STATUS.forbidden);
		expect(error.path).toBe('RateLimit.ban');
		expect(error.cause).toBe('rate limit ban reached (retry in 1 hour)');
	});
});
