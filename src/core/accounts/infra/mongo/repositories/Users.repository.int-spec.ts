import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { UsersRepository } from './Users.repository';
import { UserModel } from '../entities/user.model';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { UserEmailAlreadyExistsError } from '@/core/accounts/errors/user.errors';
import { NotFoundError } from '@/shared/error/error.lib';

let repository: UsersRepository;

describe('UsersRepository (integration)', () => {
	beforeAll(async () => {
		await UserModel.init();
	});

	beforeEach(() => {
		repository = new UsersRepository();
	});

	afterEach(async () => {
		await UserModel.deleteMany({});
	});

	it('returns lean documents without __v on findById and findAll', async () => {
		const created = await repository.create(createUserFactory({ email: 'lean@example.com' }));

		const byId = await repository.findById(created.id);
		const [listed] = await repository.findAll({});

		expect(byId as Record<string, unknown>).not.toHaveProperty('__v');
		expect(listed as Record<string, unknown>).not.toHaveProperty('__v');
	});

	it('findByEmail returns the matching user and null on no match', async () => {
		await repository.create(createUserFactory({ email: 'find@example.com' }));

		const found = await repository.findByEmail('find@example.com');
		expect(found?.email).toBe('find@example.com');

		expect(await repository.findByEmail('missing@example.com')).toBeNull();
	});

	it('findByEmail is effectively case-insensitive via the schema lowercase setter', async () => {
		// The schema `lowercase: true` setter is applied to the query filter too, so
		// Mongoose lowercases the lookup value before matching. The stored email is
		// already lowercased, so both the lowercased and the original mixed-case lookups match.
		await repository.create(createUserFactory({ email: 'Mixed.Case@Example.COM' }));

		expect(await repository.findByEmail('mixed.case@example.com')).not.toBeNull();
		expect(await repository.findByEmail('Mixed.Case@Example.COM')).not.toBeNull();
	});

	it('throws NotFoundError on update/delete of a missing id and returns the updated doc on success', async () => {
		await expect(repository.update({ id: new ObjectId().toString(), name: 'Jane' })).rejects.toBeInstanceOf(
			NotFoundError,
		);
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);

		const created = await repository.create(createUserFactory({ email: 'update@example.com' }));
		const updated = await repository.update({ id: created.id, name: 'Jane' });
		expect(updated.name).toBe('Jane');
	});

	it('runs schema validators on updates', async () => {
		const created = await repository.create(createUserFactory({ email: 'validated-update@example.com' }));

		await expect(repository.update({ id: created.id, role: 'superuser' as never })).rejects.toThrow();
		await expect(repository.update({ id: created.id, status: 'frozen' as never })).rejects.toThrow();
	});

	it('translates a duplicate email on create to UserEmailAlreadyExistsError', async () => {
		await repository.create(createUserFactory({ email: 'raceless@example.com' }));

		const duplicate = repository.create(createUserFactory({ email: 'raceless@example.com' }));
		await expect(duplicate).rejects.toBeInstanceOf(UserEmailAlreadyExistsError);
	});

	it('resolves a concurrent duplicate-email create race to one persisted user and one rejection', async () => {
		const email = 'race@example.com';

		const results = await Promise.allSettled([
			repository.create(createUserFactory({ email })),
			repository.create(createUserFactory({ email })),
		]);

		const fulfilled = results.filter((result) => result.status === 'fulfilled');
		const rejected = results.filter((result) => result.status === 'rejected');
		expect(fulfilled).toHaveLength(1);
		expect(rejected).toHaveLength(1);
		expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(UserEmailAlreadyExistsError);

		const persisted = await UserModel.countDocuments({ email });
		expect(persisted).toBe(1);
	});

	it('translates an email-rename update collision to a domain UserEmailAlreadyExistsError', async () => {
		const existing = await repository.create(createUserFactory({ email: 'taken@example.com' }));
		const mover = await repository.create(createUserFactory({ email: 'mover@example.com' }));

		await expect(repository.update({ id: mover.id, email: existing.email })).rejects.toBeInstanceOf(
			UserEmailAlreadyExistsError,
		);
	});

	it('orders findAll deterministically with the _id tie-breaker under equal sort keys', async () => {
		const sharedDate = new Date('2024-01-01T00:00:00.000Z');
		const ids = [new ObjectId(), new ObjectId(), new ObjectId()];
		await UserModel.collection.insertMany(
			ids.map((id, index) => ({
				_id: id,
				name: 'John',
				surname: 'Doe',
				email: `user${index}@example.com`,
				email_verified: false,
				role: 'member',
				status: 'active',
				created_at: sharedDate,
				updated_at: sharedDate,
			})),
		);

		const expectedOrder = [...ids].map((id) => id.toString()).sort((a, b) => (a > b ? -1 : 1));

		const firstPage = await repository.findAll({ page: 1, limit: 2, sort: { createdAt: -1 } });
		const secondPage = await repository.findAll({ page: 2, limit: 2, sort: { createdAt: -1 } });

		expect(firstPage.map((item) => item.id)).toEqual(expectedOrder.slice(0, 2));
		expect(secondPage.map((item) => item.id)).toEqual(expectedOrder.slice(2, 3));
	});

	it('succeeds with no sort supplied', async () => {
		await repository.create(createUserFactory({ email: 'nosort@example.com' }));
		await expect(repository.findAll({})).resolves.toHaveLength(1);
	});
});
