import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { CredentialsRepository } from './Credentials.repository';
import { CredentialModel } from '../entities/credential.model';
import { BadRequestError } from '@/shared/error/error.lib';

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

	it('creates and reads back a credential without __v', async () => {
		const user_id = new ObjectId().toString();
		const created = await repository.create({ user_id, password_hash: 'hashed-password' });

		expect(created.user_id).toBe(user_id);

		const found = await repository.findByUserId(user_id);
		expect(found?.password_hash).toBe('hashed-password');
		expect(found as Record<string, unknown>).not.toHaveProperty('__v');
	});

	it('findByUserId returns null when there is no credential', async () => {
		expect(await repository.findByUserId(new ObjectId().toString())).toBeNull();
	});

	it('updates the password_hash of an existing credential', async () => {
		const user_id = new ObjectId().toString();
		await repository.create({ user_id, password_hash: 'hashed-password' });

		await repository.update({ user_id, password_hash: 'new-hash' });

		expect((await repository.findByUserId(user_id))?.password_hash).toBe('new-hash');
	});

	it('deleteByUserId removes the credential', async () => {
		const user_id = new ObjectId().toString();
		await repository.create({ user_id, password_hash: 'hashed-password' });

		await repository.deleteByUserId(user_id);

		expect(await repository.findByUserId(user_id)).toBeNull();
	});

	it('translates a duplicate user_id create to a domain BadRequestError', async () => {
		const user_id = new ObjectId().toString();
		await repository.create({ user_id, password_hash: 'hashed-password' });

		await expect(repository.create({ user_id, password_hash: 'other-hash' })).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});

	it('resolves a concurrent duplicate user_id create race to one persisted record and one rejection', async () => {
		const user_id = new ObjectId().toString();

		const results = await Promise.allSettled([
			repository.create({ user_id, password_hash: 'hashed-password' }),
			repository.create({ user_id, password_hash: 'other-hash' }),
		]);

		const fulfilled = results.filter((result) => result.status === 'fulfilled');
		const rejected = results.filter((result) => result.status === 'rejected');
		expect(fulfilled).toHaveLength(1);
		expect(rejected).toHaveLength(1);
		expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(BadRequestError);

		expect(await CredentialModel.countDocuments({ user_id })).toBe(1);
	});
});
