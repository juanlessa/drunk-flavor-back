import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { AuthenticatedSession } from '@/core/accounts/dtos/session.dtos';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { Roles } from '@/shared/accessControl/roles';
import { loadCurrentSession } from './session.helpers';

const PATH = 'session.helpers.spec';

let usersRepository: UsersRepositoryInMemory;

const createSessionUser = async (overrides: Parameters<typeof createUserFactory>[0] = {}) => {
	const user = await usersRepository.create(
		createUserFactory({ role: Roles.member, sessionVersion: 3, ...overrides }),
	);
	const session: AuthenticatedSession = {
		id: user.id,
		role: user.role,
		status: user.status,
		sessionVersion: user.sessionVersion,
	};
	return { user, session };
};

describe('Session Helpers', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
	});

	describe('loadCurrentSession', () => {
		it('returns the persisted session so role and status changes are reflected', async () => {
			const { user, session } = await createSessionUser({ status: UserStatuses.incomplete_profile });
			await usersRepository.update({ id: user.id, role: Roles.partner });

			await expect(loadCurrentSession(usersRepository, session, PATH)).resolves.toEqual({
				...session,
				role: Roles.partner,
			});
		});

		it('rejects a session whose persisted version changed', async () => {
			const { user, session } = await createSessionUser();
			await usersRepository.incrementSessionVersion(user.id);

			await expect(loadCurrentSession(usersRepository, session, PATH)).rejects.toBeInstanceOf(
				SessionRevokedError,
			);
		});

		it('rejects a user whose persisted status cannot hold a session', async () => {
			const { user, session } = await createSessionUser();
			await usersRepository.update({ id: user.id, status: UserStatuses.suspended });

			await expect(loadCurrentSession(usersRepository, session, PATH)).rejects.toBeInstanceOf(
				SessionRevokedError,
			);
		});

		it('rejects a missing user', async () => {
			const { user, session } = await createSessionUser();
			await usersRepository.delete(user.id);

			await expect(loadCurrentSession(usersRepository, session, PATH)).rejects.toBeInstanceOf(
				SessionRevokedError,
			);
		});

		it('propagates user store failures instead of treating them as revoked sessions', async () => {
			const { session } = await createSessionUser();
			const failure = new Error('database unavailable');
			vi.spyOn(usersRepository, 'findById').mockRejectedValue(failure);

			await expect(loadCurrentSession(usersRepository, session, PATH)).rejects.toBe(failure);
		});
	});
});
