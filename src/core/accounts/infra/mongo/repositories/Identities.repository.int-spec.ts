import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { IdentitiesRepository } from './Identities.repository';
import { IdentityModel } from '../entities/identity.model';
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
	pictureUrl: 'https://example.com/avatar.png',
});

let repository: IdentitiesRepository;

describe('IdentitiesRepository (integration)', () => {
	beforeAll(async () => {
		await IdentityModel.init();
	});
	beforeEach(() => {
		repository = new IdentitiesRepository();
	});
	afterEach(async () => {
		await IdentityModel.deleteMany({});
	});

	it('creates and finds a camelCase identity without __v', async () => {
		const providerSubject = new ObjectId().toString();
		const created = await repository.create(buildIdentity({ providerSubject }));
		const found = await repository.findByProviderSub('google', providerSubject);
		expect(found?.id).toBe(created.id);
		expect(found?.pictureUrl).toBe('https://example.com/avatar.png');
		expect(found as Record<string, unknown>).not.toHaveProperty('__v');
	});

	it('findByProviderSub returns null when there is no match', async () => {
		expect(await repository.findByProviderSub('google', new ObjectId().toString())).toBeNull();
	});

	it('touchLastLogin sets lastLoginAt', async () => {
		const created = await repository.create(buildIdentity());
		const date = new Date('2030-01-01T00:00:00.000Z');
		await repository.touchLastLogin(created.id, date);
		const found = await repository.findByProviderSub('google', created.providerSubject);
		expect(found?.lastLoginAt?.getTime()).toBe(date.getTime());
	});

	it('findByUserId returns the identity of a user', async () => {
		const userId = new ObjectId().toString();
		await repository.create(buildIdentity({ userId }));
		await repository.create(buildIdentity());
		expect(await repository.findByUserId(userId)).toHaveLength(1);
	});

	it('lists providers by user and excludes identities owned by other users', async () => {
		const userId = new ObjectId().toString();
		await repository.create(buildIdentity({ userId }));
		await repository.create(buildIdentity());

		expect(await repository.listProvidersByUserId(userId)).toEqual(['google']);
		expect(await repository.listProvidersByUserId('missing-user')).toEqual([]);
	});

	it('deletes all identities owned by a user without deleting other identities', async () => {
		const userId = new ObjectId().toString();
		await repository.create(buildIdentity({ userId }));
		const other = await repository.create(buildIdentity());

		await repository.deleteByUserId(userId);

		expect(await repository.findByUserId(userId)).toEqual([]);
		expect(await repository.findByUserId(other.userId)).toHaveLength(1);
	});

	it('ignores an invalid identity id when touching last login', async () => {
		await expect(repository.touchLastLogin('invalid-id', new Date())).resolves.toBeUndefined();
	});

	it('rejects a second identity for the same user and provider', async () => {
		const userId = new ObjectId().toString();
		await repository.create(buildIdentity({ userId }));
		await expect(repository.create(buildIdentity({ userId }))).rejects.toBeInstanceOf(
			IdentityUserProviderAlreadyExistsError,
		);
	});

	it('translates a duplicate provider subject to a semantic identity error', async () => {
		const providerSubject = new ObjectId().toString();
		await repository.create(buildIdentity({ providerSubject }));
		await expect(repository.create(buildIdentity({ providerSubject }))).rejects.toBeInstanceOf(
			IdentityProviderSubjectAlreadyExistsError,
		);
	});

	it('resolves a concurrent duplicate identity race to one record and one rejection', async () => {
		const providerSubject = new ObjectId().toString();
		const results = await Promise.allSettled([
			repository.create(buildIdentity({ providerSubject })),
			repository.create(buildIdentity({ providerSubject })),
		]);
		expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
		const rejected = results.filter((result) => result.status === 'rejected');
		expect(rejected).toHaveLength(1);
		expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(IdentityProviderSubjectAlreadyExistsError);
		expect(await IdentityModel.countDocuments({ provider: 'google', provider_sub: providerSubject })).toBe(1);
	});
});
