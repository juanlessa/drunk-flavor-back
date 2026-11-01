import { describe, expect, it, vi } from 'vitest';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { AUTH_COOKIE } from '../constants/cookie.constants';
import { errorHandler } from './errorHandler';

const createContext = () => {
	const send = vi.fn();
	const reply = {
		clearCookie: vi.fn(),
		status: vi.fn(() => ({ send })),
	};
	const request = {
		session: { delete: vi.fn() },
		i18n: { t: vi.fn((key: string) => `translated:${key}`) },
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
			localeKey: 'apiResponses.auth.sessionRevoked',
			message: 'translated:apiResponses.auth.sessionRevoked',
		});
	});

	it('keeps credentials on infrastructure failures', async () => {
		const { request, reply } = createContext();

		await errorHandler(new Error('database unavailable'), request as never, reply as never);

		expect(request.session.delete).not.toHaveBeenCalled();
		expect(reply.clearCookie).not.toHaveBeenCalled();
		expect(reply.status).toHaveBeenCalledWith(HTTP_STATUS.internal_server_error);
	});
});
