import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import {
	USER_TOKEN_EXPIRES_AT_TTL_INDEX,
	USER_TOKEN_TOKEN_UNIQUE_INDEX,
	USER_TOKEN_USER_TYPE_UNIQUE_INDEX,
	UserTokenModel,
} from '@/core/accounts/infra/mongo/entities/userToken.model';
import { CreateUserToken } from '@/core/accounts/dtos/userToken.dtos';

type IndexInfo = {
	name: string;
	key: Record<string, number>;
	unique?: boolean;
	expireAfterSeconds?: number;
};

const getIndexes = async (): Promise<IndexInfo[]> =>
	(await UserTokenModel.collection.indexes()) as unknown as IndexInfo[];

const buildToken = (overrides?: Partial<CreateUserToken>): CreateUserToken => ({
	token: overrides?.token ?? new ObjectId().toString(),
	user_id: overrides?.user_id ?? new ObjectId().toString(),
	type: overrides?.type ?? 'email-verification',
	expires_at: overrides?.expires_at ?? new Date(Date.now() + 60 * 60 * 1000),
});

describe('UserTokenModel (integration)', () => {
	beforeAll(async () => {
		await UserTokenModel.init();
	});

	afterEach(async () => {
		await UserTokenModel.deleteMany({});
	});

	it('resolves to the users-tokens collection', () => {
		expect(UserTokenModel.collection.collectionName).toBe('users-tokens');
	});

	it('declares exactly the expected named indexes and no implicit field-level index', async () => {
		const names = (await getIndexes()).map((index) => index.name).sort();

		expect(names).toEqual(
			[
				'_id_',
				USER_TOKEN_TOKEN_UNIQUE_INDEX,
				USER_TOKEN_USER_TYPE_UNIQUE_INDEX,
				USER_TOKEN_EXPIRES_AT_TTL_INDEX,
			].sort(),
		);

		// The old auto-named indexes must no longer exist.
		expect(names).not.toContain('token_1');
		expect(names).not.toContain('user_id_1_type_1');
		expect(names).not.toContain('expires_at_1');
	});

	it('enforces a unique token index', async () => {
		const tokenIndex = (await getIndexes()).find((index) => index.name === USER_TOKEN_TOKEN_UNIQUE_INDEX);

		expect(tokenIndex?.key).toEqual({ token: 1 });
		expect(tokenIndex?.unique).toBe(true);
	});

	it('enforces a unique compound (user_id, type) index', async () => {
		const pairIndex = (await getIndexes()).find((index) => index.name === USER_TOKEN_USER_TYPE_UNIQUE_INDEX);

		expect(pairIndex?.key).toEqual({ user_id: 1, type: 1 });
		expect(pairIndex?.unique).toBe(true);
	});

	it('declares a TTL index on expires_at with expireAfterSeconds 0', async () => {
		// Assert the TTL index is DECLARED with the option; never wait on real-time expiry.
		const ttlIndex = (await getIndexes()).find((index) => index.name === USER_TOKEN_EXPIRES_AT_TTL_INDEX);

		expect(ttlIndex?.key).toEqual({ expires_at: 1 });
		expect(ttlIndex?.expireAfterSeconds).toBe(0);
	});

	it('rejects a duplicate token with an 11000 error', async () => {
		const token = new ObjectId().toString();
		await UserTokenModel.create(buildToken({ token }));

		await expect(UserTokenModel.create(buildToken({ token }))).rejects.toMatchObject({ code: 11000 });
	});

	it('rejects a duplicate (user_id, type) pair with an 11000 error', async () => {
		const user_id = new ObjectId().toString();
		await UserTokenModel.create(buildToken({ user_id, type: 'forgot-password' }));

		await expect(UserTokenModel.create(buildToken({ user_id, type: 'forgot-password' }))).rejects.toMatchObject({
			code: 11000,
		});
	});

	it('allows the same user_id with distinct token types', async () => {
		const user_id = new ObjectId().toString();
		await UserTokenModel.create(buildToken({ user_id, type: 'email-verification' }));

		await expect(UserTokenModel.create(buildToken({ user_id, type: 'forgot-password' }))).resolves.toBeDefined();
	});

	it('preserves created_at and advances updated_at on update', async () => {
		const created = await UserTokenModel.create(buildToken());
		const originalCreatedAt = created.created_at.getTime();
		const originalUpdatedAt = created.updated_at.getTime();

		created.token = new ObjectId().toString();
		const updated = await created.save();

		expect(updated.created_at.getTime()).toBe(originalCreatedAt);
		expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
	});
});
