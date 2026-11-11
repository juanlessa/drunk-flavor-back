import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { IdentitiesRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Identities.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { SessionVersionMarkerStoreInMemory } from '@/core/accounts/stores/inMemory/SessionVersionMarker.store';
import { ConflictError, NotFoundError } from '@/shared/error/error.lib';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { RemovePasswordService } from './RemovePassword.service';

let usersRepository: UsersRepositoryInMemory;
let identitiesRepository: IdentitiesRepositoryInMemory;
let credentialsRepository: CredentialsRepositoryInMemory;
let markerStore: SessionVersionMarkerStoreInMemory;
let service: RemovePasswordService;

const seedAccount = async ({ password, google }: { password: boolean; google: boolean }) => {
	const user = await usersRepository.create(createUserFactory({ email: 'local@example.com' }));
	if (password) await credentialsRepository.create({ userId: user.id, passwordHash: 'hash' });
	if (google) {
		await identitiesRepository.create({
			userId: user.id,
			provider: IdentityProviders.google,
			providerSubject: 'google-sub',
		});
	}
	return user;
};

describe('Remove Password', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		identitiesRepository = new IdentitiesRepositoryInMemory();
		credentialsRepository = new CredentialsRepositoryInMemory();
		markerStore = new SessionVersionMarkerStoreInMemory();
		service = new RemovePasswordService(
			usersRepository,
			identitiesRepository,
			credentialsRepository,
			new FakeTransactionManager(),
			markerStore,
		);
	});

	it('removes the password from an account that has a provider', async () => {
		const user = await seedAccount({ password: true, google: true });

		await service.execute({ userId: user.id });

		expect(await credentialsRepository.existsByUserId(user.id)).toBe(false);
	});

	it('keeps the connected provider', async () => {
		const user = await seedAccount({ password: true, google: true });

		await service.execute({ userId: user.id });

		expect(await identitiesRepository.listProvidersByUserId(user.id)).toEqual([IdentityProviders.google]);
	});

	it('revokes the older sessions and raises the marker for them', async () => {
		const user = await seedAccount({ password: true, google: true });

		const result = await service.execute({ userId: user.id });

		expect(result.user.sessionVersion).toBe(user.sessionVersion + 1);
		expect(markerStore.collection.get(user.id)).toBe(user.sessionVersion + 1);
	});

	it('only touches the credential of the user who asked', async () => {
		const user = await seedAccount({ password: true, google: true });
		const otherUserId = new ObjectId().toString();
		await credentialsRepository.create({ userId: otherUserId, passwordHash: 'other-hash' });

		await service.execute({ userId: user.id });

		expect(await credentialsRepository.existsByUserId(otherUserId)).toBe(true);
	});

	it('refuses an account without a provider, leaving the password and the sessions alone', async () => {
		const user = await seedAccount({ password: true, google: false });

		await expect(service.execute({ userId: user.id })).rejects.toBeInstanceOf(ConflictError);

		expect(await credentialsRepository.existsByUserId(user.id)).toBe(true);
		expect((await usersRepository.findById(user.id))?.sessionVersion).toBe(user.sessionVersion);
		expect(markerStore.collection.size).toBe(0);
	});

	it('rejects an account that has no password', async () => {
		const user = await seedAccount({ password: false, google: true });

		await expect(service.execute({ userId: user.id })).rejects.toBeInstanceOf(NotFoundError);

		expect((await usersRepository.findById(user.id))?.sessionVersion).toBe(user.sessionVersion);
	});

	it('rejects a second removal for the same account', async () => {
		const user = await seedAccount({ password: true, google: true });
		await service.execute({ userId: user.id });

		await expect(service.execute({ userId: user.id })).rejects.toBeInstanceOf(NotFoundError);
	});

	it('rejects a user that does not exist', async () => {
		await expect(service.execute({ userId: new ObjectId().toString() })).rejects.toBeInstanceOf(NotFoundError);
	});

	it('fails when the marker cannot be raised, so a removal is never left without it', async () => {
		const user = await seedAccount({ password: true, google: true });
		markerStore.failWrites = true;

		await expect(service.execute({ userId: user.id })).rejects.toThrow(
			'Session version marker store is unavailable',
		);
	});
});
