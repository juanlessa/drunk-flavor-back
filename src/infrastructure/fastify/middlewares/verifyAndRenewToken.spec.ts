import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { User } from '@/core/accounts/entities/user.entity';
import { Role, Roles } from '@/shared/accessControl/roles';
import { JwtErrors } from '../types/jwt.types';

const findUserByIdMock = vi.hoisted(() => vi.fn());

vi.mock('@/core/accounts/public', () => ({
	resolveAccountsModule: () => ({ findUserById: findUserByIdMock }),
}));

import { verifyAndRenewToken } from './verifyAndRenewToken';

const makeUser = (role: Role = Roles.member, overrides: Partial<User> = {}): User => ({
	id: 'user-id',
	name: 'Taylor',
	surname: 'Tester',
	email: 'taylor@example.com',
	emailVerified: true,
	role,
	status: UserStatuses.active,
	sessionVersion: 3,
	createdAt: new Date('2025-01-01T00:00:00.000Z'),
	updatedAt: new Date('2025-01-01T00:00:00.000Z'),
	...overrides,
});

const createContext = (role: Role = Roles.member) => {
	const request = {
		user: { id: 'user-id', role, status: UserStatuses.active, sessionVersion: 3 },
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

describe('verifyAndRenewToken', () => {
	beforeEach(() => {
		findUserByIdMock.mockReset();
	});

	it.each([Roles.owner, Roles.admin, Roles.partner, Roles.member])(
		'checks persisted status and session version for a valid %s access token',
		async (role) => {
			const persisted = makeUser(role, { status: UserStatuses.incomplete_profile });
			findUserByIdMock.mockResolvedValue(persisted);
			const { request, reply } = createContext(role);

			await verifyAndRenewToken(request as never, reply as never);

			expect(findUserByIdMock).toHaveBeenCalledWith('user-id');
			expect(request.user).toEqual({
				id: persisted.id,
				role,
				status: UserStatuses.incomplete_profile,
				sessionVersion: 3,
			});
			expect(request.sessionJwtVerify).not.toHaveBeenCalled();
			expect(reply.setCookie).not.toHaveBeenCalled();
		},
	);

	it('checks the persisted session before renewing an expired access token', async () => {
		const persisted = makeUser(Roles.partner);
		findUserByIdMock.mockResolvedValue(persisted);
		const { request, reply } = createContext(Roles.partner);
		request.jwtVerify.mockRejectedValue(jwtError(JwtErrors.FST_JWT_AUTHORIZATION_TOKEN_EXPIRED));

		await verifyAndRenewToken(request as never, reply as never);

		expect(request.sessionJwtVerify).toHaveBeenCalledTimes(1);
		expect(findUserByIdMock).toHaveBeenCalledWith('user-id');
		expect(reply.jwtSign).toHaveBeenCalledWith(
			{ role: Roles.partner, status: UserStatuses.active, sessionVersion: 3 },
			{ sign: { sub: 'user-id' } },
		);
		expect(reply.setCookie).toHaveBeenCalledWith('Authorization', 'new-access-token', expect.any(Object));
	});

	it.each(['access', 'session'] as const)('signs out for invalid %s JWT credentials', async (credential) => {
		findUserByIdMock.mockResolvedValue(makeUser());
		const { request, reply } = createContext();
		const error = jwtError(JwtErrors.FST_JWT_AUTHORIZATION_TOKEN_INVALID);
		if (credential === 'access') {
			request.jwtVerify.mockRejectedValue(error);
		} else {
			request.jwtVerify.mockRejectedValue(jwtError(JwtErrors.FST_JWT_AUTHORIZATION_TOKEN_EXPIRED));
			request.sessionJwtVerify.mockRejectedValue(error);
		}

		await expect(verifyAndRenewToken(request as never, reply as never)).rejects.toBe(error);
		expect(request.session.delete).toHaveBeenCalledTimes(1);
		expect(reply.clearCookie).toHaveBeenCalledWith('Authorization');
	});

	it.each([
		['missing', null],
		['inactive', makeUser(Roles.member, { status: UserStatuses.suspended })],
		['stale', makeUser(Roles.member, { sessionVersion: 4 })],
	] as const)(
		'propagates SessionRevokedError for a %s persisted session without middleware sign-out',
		async (_case, user) => {
			findUserByIdMock.mockResolvedValue(user);
			const { request, reply } = createContext();

			await expect(verifyAndRenewToken(request as never, reply as never)).rejects.toBeInstanceOf(
				SessionRevokedError,
			);
			expect(request.session.delete).not.toHaveBeenCalled();
			expect(reply.clearCookie).not.toHaveBeenCalled();
		},
	);

	it.each(['access', 'refresh'] as const)(
		'propagates repository failure by identity without clearing credentials on the %s path',
		async (path) => {
			const failure = new Error('database unavailable');
			findUserByIdMock.mockRejectedValue(failure);
			const { request, reply } = createContext();
			if (path === 'refresh') {
				request.jwtVerify.mockRejectedValue(jwtError(JwtErrors.FST_JWT_AUTHORIZATION_TOKEN_EXPIRED));
			}

			await expect(verifyAndRenewToken(request as never, reply as never)).rejects.toBe(failure);
			expect(request.session.delete).not.toHaveBeenCalled();
			expect(reply.clearCookie).not.toHaveBeenCalled();
		},
	);
});
