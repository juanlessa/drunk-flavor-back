import { beforeEach, describe, expect, it } from 'vitest';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { AccountsModule } from './AccountsModule';

let usersRepository: UsersRepositoryInMemory;
let accountsModule: AccountsModule;

beforeEach(() => {
	usersRepository = new UsersRepositoryInMemory();
	accountsModule = new AccountsModule(usersRepository);
});

describe('AccountsModule public API', () => {
	it('finds and returns a domain user by id', async () => {
		const user = await usersRepository.create(createUserFactory());

		await expect(accountsModule.findUserById(user.id)).resolves.toEqual(user);
	});

	it('returns null when the user does not exist', async () => {
		await expect(accountsModule.findUserById('missing-user')).resolves.toBeNull();
	});
});
