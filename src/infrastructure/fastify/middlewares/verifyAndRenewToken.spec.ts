import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { Role, Roles } from '@/shared/accessControl/roles';
import { JwtErrors } from '../types/jwt.types';

const validateOngoingSessionMock = vi.hoisted(() => vi.fn());
const validateSessionRenewalMock = vi.hoisted(() => vi.fn());

vi.mock('@/core/accounts/public', () => ({
	resolveAccountsModule: () => ({
		validateOngoingSession: validateOngoingSessionMock,
		validateSessionRenewal: validateSessionRenewalMock,
	}),
}));

import { verifyAndRenewToken } from './verifyAndRenewToken';

const makeClaims = (role: Role = Roles.member) => ({
	id: 'user-id',
	role,
	status: UserStatuses.active,
	sessionVersion: 3,
});

const createContext = (role: Role = Roles.member) => {
	const request = {
		user: makeClaims(role),
		jwtVerify: vi.fn(async () => undefined),
		sessionJwtVerify: vi.fn(async () => undefined),
		session: { delete: vi.fn() },
	};
	const reply = {
		clearCookie: vi.fn(),
		jwtSign: vi.fn(async () => 'new-access-token'),
		setCookie: vi.fn(),
	};
	return { request, reply };
};

const jwtError = (code: (typeof JwtErrors)[keyof typeof JwtErrors]) =>
	Object.assign(new Error(code), { code, statusCode: 401 });

const expireAccessToken = (request: ReturnType<typeof createContext>['request']) =>
	request.jwtVerify.mockRejectedValue(jwtError(JwtErrors.FST_JWT_AUTHORIZATION_TOKEN_EXPIRED));

describe('verifyAndRenewToken', () => {
	beforeEach(() => {
		validateOngoingSessionMock.mockReset();
		validateSessionRenewalMock.mockReset();
	});

	it.each([Roles.owner, Roles.admin, Roles.partner, Roles.member])(
		'validates the ongoing session of a valid %s access token without renewing it',
		async (role) => {
			const validated = { ...makeClaims(role), status: UserStatuses.incomplete_profile };
			validateOngoingSessionMock.mockResolvedValue(validated);
			const { request, reply } = createContext(role);

			await verifyAndRenewToken(request as never, reply as never);

			expect(validateOngoingSessionMock).toHaveBeenCalledWith({ session: makeClaims(role) });
			expect(validateSessionRenewalMock).not.toHaveBeenCalled();
			expect(request.user).toEqual(validated);
			expect(request.sessionJwtVerify).not.toHaveBeenCalled();
			expect(reply.setCookie).not.toHaveBeenCalled();
		},
	);

	it('validates the session renewal before renewing an expired access token', async () => {
		const validated = makeClaims(Roles.partner);
		validateSessionRenewalMock.mockResolvedValue(validated);
		const { request, reply } = createContext(Roles.partner);
		expireAccessToken(request);

		await verifyAndRenewToken(request as never, reply as never);

		expect(request.sessionJwtVerify).toHaveBeenCalledTimes(1);
		expect(validateSessionRenewalMock).toHaveBeenCalledWith({ session: makeClaims(Roles.partner) });
		expect(validateOngoingSessionMock).not.toHaveBeenCalled();
		expect(reply.jwtSign).toHaveBeenCalledWith(
			{ role: Roles.partner, status: UserStatuses.active, sessionVersion: 3 },
			{ sign: { sub: 'user-id' } },
		);
		expect(reply.setCookie).toHaveBeenCalledWith('Authorization', 'new-access-token', expect.any(Object));
		expect(request.user).toEqual(validated);
	});

	it.each(['access', 'session'] as const)('signs out for invalid %s JWT credentials', async (credential) => {
		const { request, reply } = createContext();
		const error = jwtError(JwtErrors.FST_JWT_AUTHORIZATION_TOKEN_INVALID);
		if (credential === 'access') {
			request.jwtVerify.mockRejectedValue(error);
		} else {
			expireAccessToken(request);
			request.sessionJwtVerify.mockRejectedValue(error);
		}

		await expect(verifyAndRenewToken(request as never, reply as never)).rejects.toBe(error);
		expect(request.session.delete).toHaveBeenCalledTimes(1);
		expect(reply.clearCookie).toHaveBeenCalledWith('Authorization');
		expect(validateOngoingSessionMock).not.toHaveBeenCalled();
		expect(validateSessionRenewalMock).not.toHaveBeenCalled();
	});

	it.each(['access', 'refresh'] as const)(
		'propagates SessionRevokedError on the %s path without middleware sign-out',
		async (path) => {
			const revoked = new SessionRevokedError({ path: 'test' });
			validateOngoingSessionMock.mockRejectedValue(revoked);
			validateSessionRenewalMock.mockRejectedValue(revoked);
			const { request, reply } = createContext();
			if (path === 'refresh') {
				expireAccessToken(request);
			}

			await expect(verifyAndRenewToken(request as never, reply as never)).rejects.toBeInstanceOf(
				SessionRevokedError,
			);
			expect(request.session.delete).not.toHaveBeenCalled();
			expect(reply.clearCookie).not.toHaveBeenCalled();
			expect(reply.setCookie).not.toHaveBeenCalled();
		},
	);

	it.each(['access', 'refresh'] as const)(
		'propagates infrastructure failures by identity without clearing credentials on the %s path',
		async (path) => {
			const failure = new Error('database unavailable');
			validateOngoingSessionMock.mockRejectedValue(failure);
			validateSessionRenewalMock.mockRejectedValue(failure);
			const { request, reply } = createContext();
			if (path === 'refresh') {
				expireAccessToken(request);
			}

			await expect(verifyAndRenewToken(request as never, reply as never)).rejects.toBe(failure);
			expect(request.session.delete).not.toHaveBeenCalled();
			expect(reply.clearCookie).not.toHaveBeenCalled();
		},
	);
});
