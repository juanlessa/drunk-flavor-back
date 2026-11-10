import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { IdentitiesRepositoryInMemory } from './Identities.repository';
import {
	IdentityProviderSubjectAlreadyExistsError,
	IdentityUserProviderAlreadyExistsError,
} from '@/core/accounts/errors/identity.errors';

const buildIdentity = (overrides?: { userId?: string; providerSubject?: string }) => ({
	userId: overrides?.userId ?? new ObjectId().toString(),
	provider: 'google' as const,
	providerSubject: overrides?.providerSubject ?? new ObjectId().toString(),
	email: 'johndoe@example.com',
	isEmailVerified: true,
});

let repository: IdentitiesRepositoryInMemory;

describe('IdentitiesRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new IdentitiesRepositoryInMemory();
	});

	it('assigns id and timestamps on create', async () => {
		const created = await repository.create(buildIdentity());

		expect(created.id).toEqual(expect.any(String));
		expect(created.createdAt).toBeInstanceOf(Date);
		expect(created.updatedAt).toBeInstanceOf(Date);
	});

	it('findByProviderSub returns the match or null', async () => {
		const providerSubject = new ObjectId().toString();
		await repository.create(buildIdentity({ providerSubject }));

		expect((await repository.findByProviderSub('google', providerSubject))?.providerSubject).toBe(providerSubject);
		expect(await repository.findByProviderSub('google', new ObjectId().toString())).toBeNull();
	});

	it('touchLastLogin updates lastLoginAt', async () => {
		const created = await repository.create(buildIdentity());
		const date = new Date('2030-01-01T00:00:00.000Z');

		await repository.touchLastLogin(created.id, date);

		expect((await repository.findByProviderSub('google', created.providerSubject))?.lastLoginAt?.getTime()).toBe(
			date.getTime(),
		);
	});

	it('findByUserId returns the identity of a user', async () => {
		const userId = new ObjectId().toString();
		await repository.create(buildIdentity({ userId }));
		await repository.create(buildIdentity());

		expect(await repository.findByUserId(userId)).toHaveLength(1);
	});

	it('rejects a second identity for the same user and provider', async () => {
		const userId = new ObjectId().toString();
		await repository.create(buildIdentity({ userId }));

		await expect(repository.create(buildIdentity({ userId }))).rejects.toBeInstanceOf(
			IdentityUserProviderAlreadyExistsError,
		);
	});

	it('rejects a duplicate provider subject with a semantic identity error', async () => {
		const providerSubject = new ObjectId().toString();
		await repository.create(buildIdentity({ providerSubject }));

		await expect(repository.create(buildIdentity({ providerSubject }))).rejects.toBeInstanceOf(
			IdentityProviderSubjectAlreadyExistsError,
		);
	});

	describe('deleteByUserIdAndProvider', () => {
		it('removes the identity of the user with the provider and says so', async () => {
			const userId = new ObjectId().toString();
			const providerSubject = new ObjectId().toString();
			await repository.create(buildIdentity({ userId, providerSubject }));

			expect(await repository.deleteByUserIdAndProvider(userId, 'google')).toBe(true);

			expect(await repository.findByUserId(userId)).toEqual([]);
			expect(await repository.findByProviderSub('google', providerSubject)).toBeNull();
		});

		it('leaves the identities of other users', async () => {
			const userId = new ObjectId().toString();
			await repository.create(buildIdentity({ userId }));
			const other = await repository.create(buildIdentity());

			await repository.deleteByUserIdAndProvider(userId, 'google');

			expect(await repository.findByUserId(other.userId)).toHaveLength(1);
		});

		it('says there was nothing to remove when the user has no identity with the provider', async () => {
			await repository.create(buildIdentity());

			expect(await repository.deleteByUserIdAndProvider(new ObjectId().toString(), 'google')).toBe(false);
		});

		it('allows the user to connect the provider again afterwards', async () => {
			const userId = new ObjectId().toString();
			await repository.create(buildIdentity({ userId }));
			await repository.deleteByUserIdAndProvider(userId, 'google');

			await expect(repository.create(buildIdentity({ userId }))).resolves.toMatchObject({ userId });
		});
	});
});
