import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { CredentialsRepository } from './Credentials.repository';
import { CredentialModel } from '../entities/credential.model';
import { CredentialAlreadyExistsError } from '@/core/accounts/errors/credential.errors';

let repository: CredentialsRepository;

describe('CredentialsRepository (integration)', () => {
	beforeAll(async () => {
		await CredentialModel.init();
	});
	beforeEach(() => {
		repository = new CredentialsRepository();
	});
	afterEach(async () => {
		await CredentialModel.deleteMany({});
	});

	it('creates and reads back a camelCase credential without __v', async () => {
		const userId = new ObjectId().toString();
		const created = await repository.create({ userId, passwordHash: 'hashed-password' });
		expect(created.userId).toBe(userId);
		expect(created.id).toEqual(expect.any(String));
		const found = await repository.findByUserId(userId);
		expect(found?.passwordHash).toBe('hashed-password');
		expect(found as Record<string, unknown>).not.toHaveProperty('__v');
	});

	it('findByUserId returns null when there is no credential', async () => {
		expect(await repository.findByUserId(new ObjectId().toString())).toBeNull();
	});

	it('updates the passwordHash of an existing credential', async () => {
		const userId = new ObjectId().toString();
		await repository.create({ userId, passwordHash: 'hashed-password' });
		await repository.update({ userId, passwordHash: 'new-hash' });
		expect((await repository.findByUserId(userId))?.passwordHash).toBe('new-hash');
	});

	it('deleteByUserId removes the credential', async () => {
		const userId = new ObjectId().toString();
		await repository.create({ userId, passwordHash: 'hashed-password' });
		await repository.deleteByUserId(userId);
		expect(await repository.findByUserId(userId)).toBeNull();
	});

	it('translates duplicate credentials to CredentialAlreadyExistsError', async () => {
		const userId = new ObjectId().toString();
		await repository.create({ userId, passwordHash: 'hashed-password' });
		await expect(repository.create({ userId, passwordHash: 'other-hash' })).rejects.toBeInstanceOf(
			CredentialAlreadyExistsError,
		);
	});

	it('resolves a concurrent duplicate userId race to one record and one rejection', async () => {
		const userId = new ObjectId().toString();
		const results = await Promise.allSettled([
			repository.create({ userId, passwordHash: 'hashed-password' }),
			repository.create({ userId, passwordHash: 'other-hash' }),
		]);
		expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
		const rejected = results.filter((result) => result.status === 'rejected');
		expect(rejected).toHaveLength(1);
		expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(CredentialAlreadyExistsError);
		expect(await CredentialModel.countDocuments({ user_id: userId })).toBe(1);
	});
});
