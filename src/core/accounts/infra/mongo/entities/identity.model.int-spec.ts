import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { IDENTITY_PROVIDER_SUB_UNIQUE_INDEX, IdentityModel } from './identity.model';

type IndexInfo = { name: string; key: Record<string, number>; unique?: boolean };

const getIndexes = async (): Promise<IndexInfo[]> =>
	(await IdentityModel.collection.indexes()) as unknown as IndexInfo[];

const buildIdentity = (overrides?: { user_id?: string; provider_sub?: string }) => ({
	user_id: overrides?.user_id ?? new ObjectId().toString(),
	provider: 'google' as const,
	provider_sub: overrides?.provider_sub ?? new ObjectId().toString(),
	email: 'johndoe@example.com',
	email_verified: true,
});

describe('IdentityModel (integration)', () => {
	beforeAll(async () => {
		await IdentityModel.init();
	});

	afterEach(async () => {
		await IdentityModel.deleteMany({});
	});

	it('resolves to the identities collection', () => {
		expect(IdentityModel.collection.collectionName).toBe('identities');
	});

	it('declares the provider/provider_sub unique index and the user_id index', async () => {
		const indexes = await getIndexes();
		const names = indexes.map((index) => index.name).sort();

		expect(names).toEqual(['_id_', IDENTITY_PROVIDER_SUB_UNIQUE_INDEX, 'identity_user_id'].sort());

		const providerSubIndex = indexes.find((index) => index.name === IDENTITY_PROVIDER_SUB_UNIQUE_INDEX);
		expect(providerSubIndex?.key).toEqual({ provider: 1, provider_sub: 1 });
		expect(providerSubIndex?.unique).toBe(true);

		const userIdIndex = indexes.find((index) => index.name === 'identity_user_id');
		expect(userIdIndex?.key).toEqual({ user_id: 1 });
		expect(userIdIndex?.unique).toBeFalsy();
	});

	it('lowercases the identity email at the Mongoose/Mongo boundary', async () => {
		const created = await IdentityModel.create(buildIdentity());
		await IdentityModel.updateOne({ _id: created._id }, { $set: { email: 'Mixed.Case@Example.COM' } });

		const reloaded = await IdentityModel.findById(created._id).lean();
		expect(reloaded?.email).toBe('mixed.case@example.com');
	});

	it('rejects an out-of-enum provider at the Mongoose boundary', async () => {
		await expect(IdentityModel.create({ ...buildIdentity(), provider: 'facebook' as never })).rejects.toThrow();
	});

	it('rejects a duplicate (provider, provider_sub) with an 11000 error', async () => {
		const provider_sub = new ObjectId().toString();
		await IdentityModel.create(buildIdentity({ provider_sub }));

		await expect(IdentityModel.create(buildIdentity({ provider_sub }))).rejects.toMatchObject({
			code: 11000,
		});
	});

	it('allows multiple identities for the same user_id', async () => {
		const user_id = new ObjectId().toString();
		await IdentityModel.create(buildIdentity({ user_id }));
		await IdentityModel.create(buildIdentity({ user_id }));

		expect(await IdentityModel.countDocuments({ user_id })).toBe(2);
	});
});
