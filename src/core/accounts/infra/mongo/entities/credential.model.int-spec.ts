import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { CREDENTIAL_USER_ID_UNIQUE_INDEX, CredentialModel } from './credential.model';

type IndexInfo = { name: string; key: Record<string, number>; unique?: boolean };

const getIndexes = async (): Promise<IndexInfo[]> =>
	(await CredentialModel.collection.indexes()) as unknown as IndexInfo[];

const buildCredentialDocument = (userId = new ObjectId().toString(), passwordHash = 'hashed-password') => ({
	user_id: userId,
	password_hash: passwordHash,
});

describe('CredentialModel (integration)', () => {
	beforeAll(async () => {
		await CredentialModel.init();
	});

	afterEach(async () => {
		await CredentialModel.deleteMany({});
	});

	it('resolves to the credentials collection', () => {
		expect(CredentialModel.collection.collectionName).toBe('credentials');
	});

	it('declares the named unique user_id index', async () => {
		const indexes = await getIndexes();
		const names = indexes.map((index) => index.name).sort();
		expect(names).toEqual(['_id_', CREDENTIAL_USER_ID_UNIQUE_INDEX].sort());
		const userIdIndex = indexes.find((index) => index.name === CREDENTIAL_USER_ID_UNIQUE_INDEX);
		expect(userIdIndex?.key).toEqual({ user_id: 1 });
		expect(userIdIndex?.unique).toBe(true);
	});

	it('persists user_id and password_hash on create', async () => {
		const userId = new ObjectId().toString();
		const created = await CredentialModel.create(buildCredentialDocument(userId));
		expect(created.user_id).toBe(userId);
		expect(created.password_hash).toBe('hashed-password');
	});

	it('rejects a duplicate user_id with an 11000 error', async () => {
		const userId = new ObjectId().toString();
		await CredentialModel.create(buildCredentialDocument(userId));
		await expect(CredentialModel.create(buildCredentialDocument(userId, 'other-hash'))).rejects.toMatchObject({
			code: 11000,
		});
	});

	it('preserves created_at and advances updated_at on update', async () => {
		const created = await CredentialModel.create(buildCredentialDocument());
		const originalCreatedAt = created.created_at.getTime();
		const originalUpdatedAt = created.updated_at.getTime();
		created.password_hash = 'new-hash';
		const updated = await created.save();
		expect(updated.created_at.getTime()).toBe(originalCreatedAt);
		expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
	});
});
