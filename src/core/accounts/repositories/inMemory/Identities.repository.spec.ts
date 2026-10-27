import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { IdentitiesRepositoryInMemory } from './Identities.repository';
import {
	IdentityProviderSubjectAlreadyExistsError,
	IdentityUserProviderAlreadyExistsError,
} from '@/core/accounts/errors/identity.errors';

const buildIdentity = (overrides?: { user_id?: string; provider_sub?: string }) => ({
	user_id: overrides?.user_id ?? new ObjectId().toString(),
	provider: 'google' as const,
	provider_sub: overrides?.provider_sub ?? new ObjectId().toString(),
	email: 'johndoe@example.com',
	email_verified: true,
});

let repository: IdentitiesRepositoryInMemory;

describe('IdentitiesRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new IdentitiesRepositoryInMemory();
	});

	it('assigns _id and timestamps on create', async () => {
		const created = await repository.create(buildIdentity());

		expect(created._id).toBeInstanceOf(ObjectId);
		expect(created.created_at).toBeInstanceOf(Date);
		expect(created.updated_at).toBeInstanceOf(Date);
	});

	it('findByProviderSub returns the match or null', async () => {
		const provider_sub = new ObjectId().toString();
		await repository.create(buildIdentity({ provider_sub }));

		expect((await repository.findByProviderSub('google', provider_sub))?.provider_sub).toBe(provider_sub);
		expect(await repository.findByProviderSub('google', new ObjectId().toString())).toBeNull();
	});

	it('touchLastLogin updates last_login_at', async () => {
		const created = await repository.create(buildIdentity());
		const date = new Date('2030-01-01T00:00:00.000Z');

		await repository.touchLastLogin(created._id.toString(), date);

		expect((await repository.findByProviderSub('google', created.provider_sub))?.last_login_at?.getTime()).toBe(
			date.getTime(),
		);
	});

	it('findByUserId returns the identity of a user', async () => {
		const user_id = new ObjectId().toString();
		await repository.create(buildIdentity({ user_id }));
		await repository.create(buildIdentity());

		expect(await repository.findByUserId(user_id)).toHaveLength(1);
	});

	it('rejects a second identity for the same user and provider', async () => {
		const user_id = new ObjectId().toString();
		await repository.create(buildIdentity({ user_id }));

		await expect(repository.create(buildIdentity({ user_id }))).rejects.toBeInstanceOf(
			IdentityUserProviderAlreadyExistsError,
		);
	});

	it('rejects a duplicate provider subject with a semantic identity error', async () => {
		const provider_sub = new ObjectId().toString();
		await repository.create(buildIdentity({ provider_sub }));

		await expect(repository.create(buildIdentity({ provider_sub }))).rejects.toBeInstanceOf(
			IdentityProviderSubjectAlreadyExistsError,
		);
	});
});
