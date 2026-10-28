import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { CredentialsRepositoryInMemory } from './Credentials.repository';

let repository: CredentialsRepositoryInMemory;

describe('CredentialsRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new CredentialsRepositoryInMemory();
	});

	it('assigns id and timestamps on create', async () => {
		const userId = new ObjectId().toString();
		const created = await repository.create({ userId, passwordHash: 'hashed-password' });

		expect(created.id).toEqual(expect.any(String));
		expect(created.userId).toBe(userId);
		expect(created.passwordHash).toBe('hashed-password');
		expect(created.createdAt).toBeInstanceOf(Date);
		expect(created.updatedAt).toBeInstanceOf(Date);
	});

	it('findByUserId returns the single credential or null', async () => {
		const userId = new ObjectId().toString();
		await repository.create({ userId, passwordHash: 'hashed-password' });

		expect((await repository.findByUserId(userId))?.passwordHash).toBe('hashed-password');
		expect(await repository.findByUserId(new ObjectId().toString())).toBeNull();
	});

	it('update replaces the passwordHash of an existing credential', async () => {
		const userId = new ObjectId().toString();
		await repository.create({ userId, passwordHash: 'hashed-password' });

		await repository.update({ userId, passwordHash: 'new-hash' });

		expect((await repository.findByUserId(userId))?.passwordHash).toBe('new-hash');
	});

	it('deleteByUserId removes only the matching credential', async () => {
		const userId = new ObjectId().toString();
		const otherUser = new ObjectId().toString();
		await repository.create({ userId, passwordHash: 'a' });
		await repository.create({ userId: otherUser, passwordHash: 'b' });

		await repository.deleteByUserId(userId);

		expect(await repository.findByUserId(userId)).toBeNull();
		expect(await repository.findByUserId(otherUser)).not.toBeNull();
	});
});
