import { User, UserRolesEnum } from '@/modules/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/modules/accounts/repositories/inMemory/Users.repository';
import { BcryptProvider } from '@/shared/providers/encryption/implementations/Bcrypt.provider';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateUserRoleService } from './UpdateUserRole.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';

let usersRepositoryInMemory: IUsersRepository;
let encryptionProvider: BcryptProvider;
let service: UpdateUserRoleService;

// test constants
const partnerName = 'partner';
const partnerSurname = 'Test';
const partnerEmail = 'partner.user@test.com';
const partnerPlanPassword = '987654321';

describe('Update User Role', () => {
	beforeEach(async () => {
		encryptionProvider = new BcryptProvider();
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		service = new UpdateUserRoleService(usersRepositoryInMemory);
	});

	it('Should be able to update the role of an user', async () => {
		const createdPartnerUser = await usersRepositoryInMemory.create({
			name: partnerName,
			surname: partnerSurname,
			email: partnerEmail,
			role: UserRolesEnum.partner,
			password: await encryptionProvider.hash(partnerPlanPassword),
		});

		await service.execute({ user_id: createdPartnerUser._id.toString(), role: UserRolesEnum.admin });

		const verifyUser = (await usersRepositoryInMemory.findById(createdPartnerUser._id.toString())) as User;

		expect(verifyUser.role).toEqual(UserRolesEnum.admin);
	});

	it('Should not be able to update the role of a nonexistent user', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(
			service.execute({
				user_id: nonexistentId,
				role: UserRolesEnum.admin,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
