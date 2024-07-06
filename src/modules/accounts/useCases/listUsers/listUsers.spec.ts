import { beforeEach, describe, expect, it } from 'vitest';
import { UserRolesEnum } from '@/modules/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/modules/accounts/repositories/inMemory/Users.repository';
import { BcryptProvider } from '@/shared/providers/encryption/implementations/Bcrypt.provider';
import { ListUsersService } from '@/modules/accounts/useCases/listUsers/ListUsers.service';
import { IEncryptionProvider } from '@/shared/providers/encryption/IEncryption.provider';
import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';

let usersRepositoryInMemory: IUsersRepository;
let encryptionProvider: IEncryptionProvider;
let service: ListUsersService;

// test constants
const partnerName = 'Partner';
const partnerSurname = 'Test';
const partnerEmail = 'partner.user@/test.com';
const partnerPlanPassword = '987654321';
const adminName = 'Admin';
const adminSurname = 'Test';
const adminEmail = 'admin.user@/test.com';
const adminPlanPassword = '123456789';

describe('List Users', () => {
	beforeEach(() => {
		encryptionProvider = new BcryptProvider();
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		service = new ListUsersService(usersRepositoryInMemory);
	});

	it('should be able to list users', async () => {
		await usersRepositoryInMemory.create({
			name: partnerName,
			surname: partnerSurname,
			email: partnerEmail,
			role: UserRolesEnum.partner,
			password: await encryptionProvider.hash(partnerPlanPassword),
		});
		const createdAdminUser = await usersRepositoryInMemory.create({
			name: adminName,
			surname: adminSurname,
			email: adminEmail,
			role: UserRolesEnum.admin,
			password: await encryptionProvider.hash(adminPlanPassword),
		});

		const users = await service.execute(createdAdminUser._id.toString());

		expect(users.length).toEqual(1);
	});
});
