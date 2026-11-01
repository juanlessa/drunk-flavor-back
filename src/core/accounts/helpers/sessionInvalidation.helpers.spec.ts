import { beforeEach, describe, expect, it } from 'vitest';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { SessionVersionMarkerStoreInMemory } from '@/core/accounts/stores/inMemory/SessionVersionMarker.store';
import { invalidateDeletedUserSessions, invalidateUserSessions } from './sessionInvalidation.helpers';

let usersRepository: UsersRepositoryInMemory;
let markerStore: SessionVersionMarkerStoreInMemory;

describe('Session Invalidation Helpers', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		markerStore = new SessionVersionMarkerStoreInMemory();
	});

	describe('invalidateUserSessions', () => {
		it('increments the persisted session version and raises the marker to the new version', async () => {
			const user = await usersRepository.create(createUserFactory({ sessionVersion: 4 }));

			const updated = await invalidateUserSessions(usersRepository, markerStore, user.id);

			expect(updated.sessionVersion).toBe(5);
			expect((await usersRepository.findById(user.id))?.sessionVersion).toBe(5);
			expect(markerStore.collection.get(user.id)).toBe(5);
		});

		it('propagates a marker failure after the increment so the surrounding transaction aborts', async () => {
			const user = await usersRepository.create(createUserFactory({ sessionVersion: 4 }));
			markerStore.failWrites = true;

			await expect(invalidateUserSessions(usersRepository, markerStore, user.id)).rejects.toThrow();
			expect(markerStore.collection.has(user.id)).toBe(false);
		});
	});

	describe('invalidateDeletedUserSessions', () => {
		it('raises a marker above the last persisted version of a deleted user', async () => {
			await invalidateDeletedUserSessions(markerStore, { id: 'deleted-user', sessionVersion: 7 });

			expect(markerStore.collection.get('deleted-user')).toBe(8);
		});
	});
});
