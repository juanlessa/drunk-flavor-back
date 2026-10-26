import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { CredentialsRepositoryInMemory } from './Credentials.repository';

let repository: CredentialsRepositoryInMemory;

describe('CredentialsRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new CredentialsRepositoryInMemory();
	});

	it('assigns _id and timestamps on create', async () => {
		const user_id = new ObjectId().toString();
		const created = await repository.create({ user_id, password_hash: 'hashed-password' });

		expect(created._id).toBeInstanceOf(ObjectId);
		expect(created.user_id).toBe(user_id);
		expect(created.password_hash).toBe('hashed-password');
		expect(created.created_at).toBeInstanceOf(Date);
		expect(created.updated_at).toBeInstanceOf(Date);
	});

	it('findByUserId returns the single credential or null', async () => {
		const user_id = new ObjectId().toString();
		await repository.create({ user_id, password_hash: 'hashed-password' });

		expect((await repository.findByUserId(user_id))?.password_hash).toBe('hashed-password');
		expect(await repository.findByUserId(new ObjectId().toString())).toBeNull();
	});

	it('update replaces the password_hash of an existing credential', async () => {
		const user_id = new ObjectId().toString();
		await repository.create({ user_id, password_hash: 'hashed-password' });

		await repository.update({ user_id, password_hash: 'new-hash' });

		expect((await repository.findByUserId(user_id))?.password_hash).toBe('new-hash');
	});

	it('deleteByUserId removes only the matching credential', async () => {
		const user_id = new ObjectId().toString();
		const otherUser = new ObjectId().toString();
		await repository.create({ user_id, password_hash: 'a' });
		await repository.create({ user_id: otherUser, password_hash: 'b' });

		await repository.deleteByUserId(user_id);

		expect(await repository.findByUserId(user_id)).toBeNull();
		expect(await repository.findByUserId(otherUser)).not.toBeNull();
	});
});
