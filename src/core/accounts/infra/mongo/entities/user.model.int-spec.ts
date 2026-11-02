import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
	USER_EMAIL_UNIQUE_INDEX,
	USER_OWNER_UNIQUE_INDEX,
	UserModel,
} from '@/core/accounts/infra/mongo/entities/user.model';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { Roles } from '@/shared/accessControl/roles';
import { UserMapper } from '@/core/accounts/infra/mongo/mappers/user.mapper';

type IndexInfo = {
	name: string;
	key: Record<string, number>;
	unique?: boolean;
	partialFilterExpression?: Record<string, unknown>;
};

const getIndexes = async (): Promise<IndexInfo[]> => (await UserModel.collection.indexes()) as unknown as IndexInfo[];

const createUserDocument = (overrides?: Parameters<typeof createUserFactory>[0]) =>
	UserMapper.toPersistence(createUserFactory(overrides));

describe('UserModel (integration)', () => {
	beforeAll(async () => {
		await UserModel.init();
	});

	afterEach(async () => {
		await UserModel.deleteMany({});
	});

	it('resolves to the users collection', () => {
		expect(UserModel.collection.collectionName).toBe('users');
	});

	it('declares the expected named unique indexes', async () => {
		const indexes = await getIndexes();
		const names = indexes.map((index) => index.name).sort();

		expect(names).toEqual(['_id_', USER_EMAIL_UNIQUE_INDEX, USER_OWNER_UNIQUE_INDEX].sort());

		const emailIndex = indexes.find((index) => index.name === USER_EMAIL_UNIQUE_INDEX);
		expect(emailIndex?.key).toEqual({ email: 1 });
		expect(emailIndex?.unique).toBe(true);

		const ownerIndex = indexes.find((index) => index.name === USER_OWNER_UNIQUE_INDEX);
		expect(ownerIndex?.key).toEqual({ role: 1 });
		expect(ownerIndex?.unique).toBe(true);
		expect(ownerIndex?.partialFilterExpression).toEqual({ role: Roles.owner });
	});

	it('lowercases the email at the Mongoose/Mongo boundary', async () => {
		const created = await UserModel.create(createUserDocument({ email: 'Mixed.Case@Example.COM' }));

		const reloaded = await UserModel.findById(created._id).lean();
		expect(reloaded?.email).toBe('mixed.case@example.com');
	});

	it('rejects a duplicate email with an 11000 error', async () => {
		await UserModel.create(createUserDocument({ email: 'dupe@example.com' }));

		await expect(UserModel.create(createUserDocument({ email: 'dupe@example.com' }))).rejects.toMatchObject({
			code: 11000,
		});
	});

	it('applies role, status, email_verified and session_version defaults when omitted', async () => {
		// Insert through the model without role/status/email_verified so the schema defaults apply.
		const created = await UserModel.create({
			name: 'John',
			surname: 'Doe',
			email: 'defaults@example.com',
		});

		expect(created.role).toBe('member');
		expect(created.status).toBe('idle');
		expect(created.email_verified).toBe(false);
		expect(created.session_version).toBe(1);
		expect(created.avatar_url).toBeUndefined();
	});

	it('persists email_verified and avatar_url when provided', async () => {
		const created = await UserModel.create(
			createUserDocument({
				email: 'verified@example.com',
				emailVerified: true,
				avatarUrl: 'https://example.com/avatar.png',
			}),
		);

		const reloaded = await UserModel.findById(created._id).lean();
		expect(reloaded?.email_verified).toBe(true);
		expect(reloaded?.avatar_url).toBe('https://example.com/avatar.png');
	});

	it('rejects out-of-enum role and status values at the Mongoose boundary', async () => {
		await expect(
			UserModel.create(createUserDocument({ email: 'badrole@example.com', role: 'superuser' as never })),
		).rejects.toThrow();

		await expect(
			UserModel.create(createUserDocument({ email: 'badstatus@example.com', status: 'frozen' as never })),
		).rejects.toThrow();
	});

	it('preserves created_at and advances updated_at on update', async () => {
		const created = await UserModel.create(createUserDocument({ email: 'timestamps@example.com' }));
		const originalCreatedAt = created.created_at.getTime();
		const originalUpdatedAt = created.updated_at.getTime();

		created.name = 'Jane';
		const updated = await created.save();

		expect(updated.created_at.getTime()).toBe(originalCreatedAt);
		expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
	});
});
