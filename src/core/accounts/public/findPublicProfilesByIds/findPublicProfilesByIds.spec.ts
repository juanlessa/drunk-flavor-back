import { beforeEach, describe, expect, it } from 'vitest';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { FindPublicProfilesByIdsService } from './FindPublicProfilesByIds.service';

let usersRepository: UsersRepositoryInMemory;
let service: FindPublicProfilesByIdsService;

describe('Find Public Profiles By Ids', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		service = new FindPublicProfilesByIdsService(usersRepository);
	});

	it('returns only the public identity fields of existing users', async () => {
		const user = await usersRepository.create(
			createUserFactory({
				email: 'public@example.com',
				name: 'Ada',
				surname: 'Lovelace',
				avatarUrl: 'https://example.com/a.png',
			}),
		);

		await expect(service.execute({ userIds: [user.id, 'missing-user'] })).resolves.toEqual([
			{ id: user.id, name: 'Ada', surname: 'Lovelace', avatarUrl: 'https://example.com/a.png' },
		]);
	});

	it('collapses duplicated ids', async () => {
		const user = await usersRepository.create(createUserFactory({ email: 'dup@example.com' }));

		await expect(service.execute({ userIds: [user.id, user.id] })).resolves.toHaveLength(1);
	});

	it('returns an empty list without querying when no ids are given', async () => {
		await expect(service.execute({ userIds: [] })).resolves.toEqual([]);
	});
});
