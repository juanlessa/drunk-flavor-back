import { describe, expect, it, vi } from 'vitest';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { AUTH_COOKIE } from '../constants/cookie.constants';
import { i18n } from '@/infrastructure/i18n';
import { FieldValidationError } from '@/shared/error/error.lib';
import { errorHandler } from './errorHandler';

const createContext = () => {
	const send = vi.fn();
	const reply = {
		clearCookie: vi.fn(),
		getHeader: vi.fn(),
		header: vi.fn(),
		status: vi.fn(() => ({ send })),
	};
	const request = {
		session: { delete: vi.fn() },
		locale: 'en',
	};
	return { request, reply, send };
};

describe('errorHandler', () => {
	it('clears both authentication credentials for a revoked session', async () => {
		const { request, reply, send } = createContext();

		await errorHandler(new SessionRevokedError({ path: 'test' }), request as never, reply as never);

		expect(request.session.delete).toHaveBeenCalledTimes(1);
		expect(reply.clearCookie).toHaveBeenCalledWith(AUTH_COOKIE);
		expect(reply.status).toHaveBeenCalledWith(HTTP_STATUS.unauthorized);
		expect(send).toHaveBeenCalledWith({
			ok: false,
			code: 'SESSION_REVOKED',
			localeKey: 'apiResponses.auth.sessionRevoked',
			message: i18n.translate('en', 'apiResponses.auth.sessionRevoked'),
		});
	});

	it('keeps credentials on infrastructure failures', async () => {
		const { request, reply } = createContext();

		await errorHandler(new Error('database unavailable'), request as never, reply as never);

		expect(request.session.delete).not.toHaveBeenCalled();
		expect(reply.clearCookie).not.toHaveBeenCalled();
		expect(reply.status).toHaveBeenCalledWith(HTTP_STATUS.internal_server_error);
	});
	it('marks the localized response with Content-Language and Vary', async () => {
		const { request, reply } = createContext();

		await errorHandler(new SessionRevokedError({ path: 'test' }), request as never, reply as never);

		expect(reply.header).toHaveBeenCalledWith('Content-Language', 'en');
		expect(reply.header).toHaveBeenCalledWith('Vary', 'Accept-Language');
	});

	it('translates unhandled errors to the internal server error message', async () => {
		const { request, reply, send } = createContext();

		await errorHandler(new Error('database unavailable'), request as never, reply as never);

		expect(send).toHaveBeenCalledWith({
			ok: false,
			code: 'INTERNAL_ERROR',
			localeKey: 'apiResponses.internalServerError',
			message: i18n.translate('en', 'apiResponses.internalServerError'),
		});
	});
	it('lists the invalid fields of a field validation error, each one translated with its params', async () => {
		const { request, reply, send } = createContext();
		const error = new FieldValidationError(
			[
				{
					location: 'body',
					path: 'preparation.actions.2',
					localeKey: 'apiResponses.drinks.preparation.nothingToShake',
				},
				{
					location: 'body',
					path: 'preparation.actions',
					localeKey: 'apiResponses.drinks.preparation.requiredActions',
					params: { min: 1 },
				},
			],
			{ path: 'test' },
		);

		await errorHandler(error, request as never, reply as never);

		expect(reply.status).toHaveBeenCalledWith(HTTP_STATUS.bad_request);
		expect(send).toHaveBeenCalledWith(
			expect.objectContaining({
				ok: false,
				code: 'VALIDATION_FAILED',
				localeKey: 'apiResponses.validation.failed',
				errors: [
					{
						location: 'body',
						path: 'preparation.actions.2',
						localeKey: 'apiResponses.drinks.preparation.nothingToShake',
						message: i18n.translate('en', 'apiResponses.drinks.preparation.nothingToShake'),
					},
					{
						location: 'body',
						path: 'preparation.actions',
						localeKey: 'apiResponses.drinks.preparation.requiredActions',
						params: { min: 1 },
						message: i18n.translate('en', 'apiResponses.drinks.preparation.requiredActions', { min: 1 }),
					},
				],
			}),
		);
	});
});
