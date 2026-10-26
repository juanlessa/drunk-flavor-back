import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { UsersRepositoryInMemory } from './Users.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { NotFoundError } from '@/shared/error/error.lib';

let repository: UsersRepositoryInMemory;

describe('UsersRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new UsersRepositoryInMemory();
	});

	describe('findByEmail', () => {
		it('returns the user on an exact match', async () => {
			await repository.create(createUserFactory({ email: 'find@example.com' }));

			expect((await repository.findByEmail('find@example.com'))?.email).toBe('find@example.com');
		});

		it('returns null on no match', async () => {
			await repository.create(createUserFactory({ email: 'find@example.com' }));

			expect(await repository.findByEmail('missing@example.com')).toBeNull();
		});

		it('matches case-sensitively (strict === on the stored value)', async () => {
			// The in-memory repo compares with a strict ===, so a differently-cased email
			// does NOT match. This diverges from the Mongo repo, where the schema lowercase
			// setter makes findByEmail effectively case-insensitive.
			await repository.create(createUserFactory({ email: 'find@example.com' }));

			expect(await repository.findByEmail('FIND@EXAMPLE.COM')).toBeNull();
		});
	});

	describe('findById', () => {
		it('returns a match and null otherwise', async () => {
			const created = await repository.create(createUserFactory({ email: 'byid@example.com' }));

			expect((await repository.findById(created._id.toString()))?.email).toBe('byid@example.com');
			expect(await repository.findById(new ObjectId().toString())).toBeNull();
		});
	});

	describe('update', () => {
		it('deep-merges partial data, refreshes updated_at and preserves untouched fields', async () => {
			const created = await repository.create(createUserFactory({ email: 'update@example.com' }));

			const updated = await repository.update({ id: created._id.toString(), name: 'Jane' });

			expect(updated.name).toBe('Jane');
			expect(updated.surname).toBe(created.surname);
			expect(updated.email).toBe('update@example.com');
			expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(created.updated_at.getTime());
		});

		it('throws NotFoundError when the id is missing', async () => {
			await expect(repository.update({ id: new ObjectId().toString(), name: 'Jane' })).rejects.toBeInstanceOf(
				NotFoundError,
			);
		});
	});

	describe('delete', () => {
		it('returns the removed record', async () => {
			const created = await repository.create(createUserFactory({ email: 'delete@example.com' }));

			const deleted = await repository.delete(created._id.toString());
			expect(deleted._id.toString()).toBe(created._id.toString());
			expect(await repository.findById(created._id.toString())).toBeNull();
		});

		it('throws NotFoundError when the id is missing', async () => {
			await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);
		});
	});
});
