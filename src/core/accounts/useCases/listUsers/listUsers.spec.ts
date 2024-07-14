import { beforeEach, describe, expect, it } from 'vitest';
import { UserRolesEnum } from '@/core/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { BcryptProvider } from '@/shared/providers/encryption/implementations/Bcrypt.provider';
import { ListUsersService } from '@/core/accounts/useCases/listUsers/ListUsers.service';
import { IEncryptionProvider } from '@/shared/providers/encryption/IEncryption.provider';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/container';

let usersRepositoryInMemory: IUsersRepository;
let encryptionProvider: IEncryptionProvider;
let service: ListUsersService;

const adminUserData = createUserFactory({ role: UserRolesEnum.admin });
const partnerUserData = createUserFactory({ email: 'partner@example.com', role: UserRolesEnum.partner });

describe('List Users', () => {
	beforeEach(() => {
		encryptionProvider = new BcryptProvider();
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		service = new ListUsersService(usersRepositoryInMemory);
	});

	it('should be able to list users', async () => {
		await usersRepositoryInMemory.create({
			name: partnerUserData.name,
			surname: partnerUserData.surname,
			email: partnerUserData.email,
			role: partnerUserData.role,
			password: await encryptionProvider.hash(partnerUserData.password),
		});
		const createdAdminUser = await usersRepositoryInMemory.create({
			name: adminUserData.name,
			surname: adminUserData.surname,
			email: adminUserData.email,
			role: adminUserData.role,
			password: await encryptionProvider.hash(adminUserData.password),
		});

		const users = await service.execute(createdAdminUser._id.toString());

		expect(users.length).toEqual(1);
	});
});
