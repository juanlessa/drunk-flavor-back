import { beforeEach, describe, expect, it } from 'vitest';
import { UserRolesEnum } from '@/core/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ListUsersService } from '@/core/accounts/useCases/listUsers/ListUsers.service';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { createUserFactory } from '../../factories/user.factories';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';

let usersRepositoryInMemory: IUsersRepository;
let hashProvider: IHashProvider;
let service: ListUsersService;

const adminUserData = createUserFactory({ role: UserRolesEnum.admin });
const partnerUserData = createUserFactory({ email: 'partner@example.com', role: UserRolesEnum.partner });

describe('List Users', () => {
	beforeEach(() => {
		hashProvider = new BcryptHashProvider();
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		service = new ListUsersService(usersRepositoryInMemory);
	});

	it('should be able to list users', async () => {
		await usersRepositoryInMemory.create({
			name: partnerUserData.name,
			surname: partnerUserData.surname,
			email: partnerUserData.email,
			role: partnerUserData.role,
			password: await hashProvider.hash(partnerUserData.password),
		});
		const createdAdminUser = await usersRepositoryInMemory.create({
			name: adminUserData.name,
			surname: adminUserData.surname,
			email: adminUserData.email,
			role: adminUserData.role,
			password: await hashProvider.hash(adminUserData.password),
		});

		const users = await service.execute(createdAdminUser._id.toString());

		expect(users.length).toEqual(1);
	});
});
