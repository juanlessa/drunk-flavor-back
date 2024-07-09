import { User, UserRolesEnum } from '@/modules/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/modules/accounts/repositories/inMemory/Users.repository';
import { BcryptProvider } from '@/shared/providers/encryption/implementations/Bcrypt.provider';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateUserRoleService } from './UpdateUserRole.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/modules/accounts/container';

let usersRepositoryInMemory: IUsersRepository;
let encryptionProvider: BcryptProvider;
let service: UpdateUserRoleService;

const { name, surname, email, password, role } = createUserFactory({ role: UserRolesEnum.partner });

describe('Update User Role', () => {
	beforeEach(async () => {
		encryptionProvider = new BcryptProvider();
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		service = new UpdateUserRoleService(usersRepositoryInMemory);
	});

	it('Should be able to update the role of a user', async () => {
		const createdPartnerUser = await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			role,
			password: await encryptionProvider.hash(password),
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
