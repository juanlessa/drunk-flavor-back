import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { SessionVersionMarkerUnavailableReasons } from '@/core/accounts/constants/sessionVersionMarker.constants';
import { AuthenticatedSession } from '@/core/accounts/dtos/session.dtos';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { SessionVersionMarkerStoreInMemory } from '@/core/accounts/stores/inMemory/SessionVersionMarker.store';
import { Roles } from '@/shared/accessControl/roles';
import { ValidateOngoingSessionService } from './ValidateOngoingSession.service';

let usersRepository: UsersRepositoryInMemory;
let markerStore: SessionVersionMarkerStoreInMemory;
let service: ValidateOngoingSessionService;

const createSessionUser = async (overrides: Parameters<typeof createUserFactory>[0] = {}) => {
	const user = await usersRepository.create(createUserFactory({ role: Roles.member, sessionVersion: 3, ...overrides }));
	const session: AuthenticatedSession = {
		id: user.id,
		role: user.role,
		status: user.status,
		sessionVersion: user.sessionVersion,
	};
	return { user, session };
};

describe('Validate Ongoing Session', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		markerStore = new SessionVersionMarkerStoreInMemory();
		service = new ValidateOngoingSessionService(usersRepository, markerStore);
	});

	it('trusts the session without loading the user when no marker exists', async () => {
		const { session } = await createSessionUser();
		const findById = vi.spyOn(usersRepository, 'findById');

		await expect(service.execute({ session })).resolves.toEqual(session);
		expect(findById).not.toHaveBeenCalled();
	});

	it('trusts the session when its version satisfies the marker', async () => {
		const { session } = await createSessionUser();
		await markerStore.raise(session.id, session.sessionVersion);
		const findById = vi.spyOn(usersRepository, 'findById');

		await expect(service.execute({ session })).resolves.toEqual(session);
		expect(findById).not.toHaveBeenCalled();
	});

	it('rejects a session below the marker once the user store confirms the version changed', async () => {
		const { user, session } = await createSessionUser();
		await usersRepository.incrementSessionVersion(user.id);
		await markerStore.raise(user.id, user.sessionVersion + 1);

		await expect(service.execute({ session })).rejects.toBeInstanceOf(SessionRevokedError);
	});

	it('accepts a session below a spurious marker when the user store still matches it', async () => {
		const { session } = await createSessionUser();
		await markerStore.raise(session.id, session.sessionVersion + 1);
		const findById = vi.spyOn(usersRepository, 'findById');

		await expect(service.execute({ session })).resolves.toEqual(session);
		expect(findById).toHaveBeenCalledWith(session.id);
	});

	it.each([SessionVersionMarkerUnavailableReasons.storeNotReady, SessionVersionMarkerUnavailableReasons.storeError])(
		'falls back to the user store when the marker store is unavailable (%s)',
		async (reason) => {
			const { user, session } = await createSessionUser();
			await usersRepository.update({ id: user.id, status: UserStatuses.suspended });
			markerStore.makeUnavailable(reason);

			await expect(service.execute({ session })).rejects.toBeInstanceOf(SessionRevokedError);
		},
	);

	it('defers to the user store instead of trusting a session that is not usable', async () => {
		const { session } = await createSessionUser();
		const findById = vi.spyOn(usersRepository, 'findById');

		await expect(service.execute({ session: { ...session, status: UserStatuses.suspended } })).resolves.toEqual(
			session,
		);
		expect(findById).toHaveBeenCalledWith(session.id);
	});

	it('rejects a deleted user whose marker is above the last persisted version', async () => {
		const { user, session } = await createSessionUser();
		await usersRepository.delete(user.id);
		await markerStore.raise(user.id, user.sessionVersion + 1);

		await expect(service.execute({ session })).rejects.toBeInstanceOf(SessionRevokedError);
	});
});
