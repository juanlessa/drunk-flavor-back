import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import {
	TOKEN_EXPIRES_AT_TTL_INDEX,
	TOKEN_UNIQUE_INDEX,
	TOKEN_USER_TYPE_UNIQUE_INDEX,
	TokenModel,
} from '@/core/accounts/infra/mongo/entities/token.model';
import { CreateToken } from '@/core/accounts/dtos/token.dtos';

type IndexInfo = {
	name: string;
	key: Record<string, number>;
	unique?: boolean;
	expireAfterSeconds?: number;
};

const getIndexes = async (): Promise<IndexInfo[]> => (await TokenModel.collection.indexes()) as unknown as IndexInfo[];

const buildToken = (overrides?: Partial<CreateToken>): CreateToken => ({
	token_hash: overrides?.token_hash ?? new ObjectId().toString(),
	user_id: overrides?.user_id ?? new ObjectId().toString(),
	type: overrides?.type ?? 'email-verification',
	expires_at: overrides?.expires_at ?? new Date(Date.now() + 60 * 60 * 1000),
});

describe('TokenModel (integration)', () => {
	beforeAll(async () => {
		await TokenModel.init();
	});

	afterEach(async () => {
		await TokenModel.deleteMany({});
	});

	it('resolves to the tokens collection', () => {
		expect(TokenModel.collection.collectionName).toBe('tokens');
	});

	it('declares exactly the expected named indexes', async () => {
		const names = (await getIndexes()).map((index) => index.name).sort();

		expect(names).toEqual(
			['_id_', TOKEN_UNIQUE_INDEX, TOKEN_USER_TYPE_UNIQUE_INDEX, TOKEN_EXPIRES_AT_TTL_INDEX].sort(),
		);
	});

	it('enforces a unique token index', async () => {
		const tokenIndex = (await getIndexes()).find((index) => index.name === TOKEN_UNIQUE_INDEX);

		expect(tokenIndex?.key).toEqual({ token_hash: 1 });
		expect(tokenIndex?.unique).toBe(true);
	});

	it('enforces a unique compound (user_id, type) index', async () => {
		const pairIndex = (await getIndexes()).find((index) => index.name === TOKEN_USER_TYPE_UNIQUE_INDEX);

		expect(pairIndex?.key).toEqual({ user_id: 1, type: 1 });
		expect(pairIndex?.unique).toBe(true);
	});

	it('declares a TTL index on expires_at with expireAfterSeconds 0', async () => {
		// Assert the TTL index is DECLARED with the option; never wait on real-time expiry.
		const ttlIndex = (await getIndexes()).find((index) => index.name === TOKEN_EXPIRES_AT_TTL_INDEX);

		expect(ttlIndex?.key).toEqual({ expires_at: 1 });
		expect(ttlIndex?.expireAfterSeconds).toBe(0);
	});

	it('rejects a duplicate token with an 11000 error', async () => {
		const token_hash = new ObjectId().toString();
		await TokenModel.create(buildToken({ token_hash }));

		await expect(TokenModel.create(buildToken({ token_hash }))).rejects.toMatchObject({ code: 11000 });
	});

	it('rejects a duplicate (user_id, type) pair with an 11000 error', async () => {
		const user_id = new ObjectId().toString();
		await TokenModel.create(buildToken({ user_id, type: 'forgot-password' }));

		await expect(TokenModel.create(buildToken({ user_id, type: 'forgot-password' }))).rejects.toMatchObject({
			code: 11000,
		});
	});

	it('allows the same user_id with distinct token types', async () => {
		const user_id = new ObjectId().toString();
		await TokenModel.create(buildToken({ user_id, type: 'email-verification' }));

		await expect(TokenModel.create(buildToken({ user_id, type: 'forgot-password' }))).resolves.toBeDefined();
	});

	it('preserves created_at and advances updated_at on update', async () => {
		const created = await TokenModel.create(buildToken());
		const originalCreatedAt = created.created_at.getTime();
		const originalUpdatedAt = created.updated_at.getTime();

		created.token_hash = new ObjectId().toString();
		const updated = await created.save();

		expect(updated.created_at.getTime()).toBe(originalCreatedAt);
		expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
	});
});
