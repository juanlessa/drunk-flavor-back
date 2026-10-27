import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { IdentitiesRepository } from './Identities.repository';
import { IdentityModel } from '../entities/identity.model';
import { BadRequestError } from '@/shared/error/error.lib';

const buildIdentity = (overrides?: { user_id?: string; provider_sub?: string }) => ({
	user_id: overrides?.user_id ?? new ObjectId().toString(),
	provider: 'google' as const,
	provider_sub: overrides?.provider_sub ?? new ObjectId().toString(),
	email: 'johndoe@example.com',
	email_verified: true,
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

	it('creates and finds an identity by provider/provider_sub without __v', async () => {
		const provider_sub = new ObjectId().toString();
		const created = await repository.create(buildIdentity({ provider_sub }));

		const found = await repository.findByProviderSub('google', provider_sub);
		expect(found?._id.toString()).toBe(created._id.toString());
		expect(found as Record<string, unknown>).not.toHaveProperty('__v');
	});

	it('findByProviderSub returns null when there is no match', async () => {
		expect(await repository.findByProviderSub('google', new ObjectId().toString())).toBeNull();
	});

	it('touchLastLogin sets last_login_at', async () => {
		const created = await repository.create(buildIdentity());
		const date = new Date('2030-01-01T00:00:00.000Z');

		await repository.touchLastLogin(created._id.toString(), date);

		const found = await repository.findByProviderSub('google', created.provider_sub);
		expect(found?.last_login_at?.getTime()).toBe(date.getTime());
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

		await expect(repository.create(buildIdentity({ user_id }))).rejects.toBeInstanceOf(BadRequestError);
	});

	it('translates a duplicate (provider, provider_sub) create to a domain BadRequestError', async () => {
		const provider_sub = new ObjectId().toString();
		await repository.create(buildIdentity({ provider_sub }));

		await expect(repository.create(buildIdentity({ provider_sub }))).rejects.toBeInstanceOf(BadRequestError);
	});

	it('resolves a concurrent duplicate identity create race to one persisted record and one rejection', async () => {
		const provider_sub = new ObjectId().toString();

		const results = await Promise.allSettled([
			repository.create(buildIdentity({ provider_sub })),
			repository.create(buildIdentity({ provider_sub })),
		]);

		const fulfilled = results.filter((result) => result.status === 'fulfilled');
		const rejected = results.filter((result) => result.status === 'rejected');
		expect(fulfilled).toHaveLength(1);
		expect(rejected).toHaveLength(1);
		expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(BadRequestError);

		expect(await IdentityModel.countDocuments({ provider: 'google', provider_sub })).toBe(1);
	});
});
