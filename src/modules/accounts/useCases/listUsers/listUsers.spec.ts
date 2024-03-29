import { UsersRepositoryInMemory } from '@modules/accounts/repositories/inMemory/Users.repository';
import { ROLES } from '@modules/accounts/types/roles';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/Bcrypt.provider';
import { beforeEach, describe, expect, it } from 'vitest';
import { ListUsersService } from '@modules/accounts/useCases/listUsers/ListUsers.service';

let usersRepositoryInMemory: UsersRepositoryInMemory;
let listUsersService: ListUsersService;
let encryptionProvider: BcryptProvider;

// test constants
const partnerName = 'Partner';
const partnerSurname = 'Test';
const partnerEmail = 'partner.user@test.com';
const partnerPlanPassword = '987654321';
const adminName = 'Admin';
const adminSurname = 'Test';
const adminEmail = 'admin.user@test.com';
const adminPlanPassword = '123456789';

describe('List Users', () => {
	beforeEach(() => {
		encryptionProvider = new BcryptProvider();
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		listUsersService = new ListUsersService(usersRepositoryInMemory);
	});

	it('should be able to list users', async () => {
		await usersRepositoryInMemory.create({
			name: partnerName,
			surname: partnerSurname,
			email: partnerEmail,
			role: ROLES.partner,
			password: await encryptionProvider.hash(partnerPlanPassword)
		});
		const createdAdminUser = await usersRepositoryInMemory.create({
			name: adminName,
			surname: adminSurname,
			email: adminEmail,
			role: ROLES.admin,
			password: await encryptionProvider.hash(adminPlanPassword)
		});

		const users = await listUsersService.execute(createdAdminUser._id);

		expect(users.length).toEqual(1);
	});
});
