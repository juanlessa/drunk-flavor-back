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

			expect((await repository.findById(created.id))?.email).toBe('byid@example.com');
			expect(await repository.findById(new ObjectId().toString())).toBeNull();
		});
	});

	describe('findByIds', () => {
		it('returns only the users whose ids match', async () => {
			const first = await repository.create(createUserFactory({ email: 'first@example.com' }));
			await repository.create(createUserFactory({ email: 'second@example.com' }));

			const found = await repository.findByIds([first.id, new ObjectId().toString()]);

			expect(found.map((user) => user.email)).toEqual(['first@example.com']);
		});
	});

	describe('update', () => {
		it('deep-merges partial data, refreshes updatedAt and preserves untouched fields', async () => {
			const created = await repository.create(createUserFactory({ email: 'update@example.com' }));

			const updated = await repository.update({ id: created.id, name: 'Jane' });

			expect(updated.name).toBe('Jane');
			expect(updated.surname).toBe(created.surname);
			expect(updated.email).toBe('update@example.com');
			expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
		});

		it('throws NotFoundError when the id is missing', async () => {
			await expect(repository.update({ id: new ObjectId().toString(), name: 'Jane' })).rejects.toBeInstanceOf(
				NotFoundError,
			);
		});
	});

	describe('incrementSessionVersion', () => {
		it('increments once, preserves fields, updates the timestamp, and stores the replacement', async () => {
			const created = await repository.create(
				createUserFactory({ email: 'sessions@example.com', sessionVersion: 3 }),
			);
			const previousUpdatedAt = created.updatedAt;

			const updated = await repository.incrementSessionVersion(created.id);

			expect(updated).toMatchObject({
				id: created.id,
				role: created.role,
				status: created.status,
				sessionVersion: 4,
			});
			expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
			expect(await repository.findById(created.id)).toEqual(updated);
		});

		it('retains both concurrent increments and rejects missing IDs', async () => {
			const created = await repository.create(createUserFactory({ email: 'concurrent@example.com' }));

			await Promise.all([
				repository.incrementSessionVersion(created.id),
				repository.incrementSessionVersion(created.id),
			]);

			expect((await repository.findById(created.id))?.sessionVersion).toBe(3);
			await expect(repository.incrementSessionVersion('missing')).rejects.toBeInstanceOf(NotFoundError);
		});
	});

	describe('delete', () => {
		it('returns the removed record', async () => {
			const created = await repository.create(createUserFactory({ email: 'delete@example.com' }));

			const deleted = await repository.delete(created.id);
			expect(deleted.id).toBe(created.id);
			expect(await repository.findById(created.id)).toBeNull();
		});

		it('throws NotFoundError when the id is missing', async () => {
			await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);
		});
	});
});
