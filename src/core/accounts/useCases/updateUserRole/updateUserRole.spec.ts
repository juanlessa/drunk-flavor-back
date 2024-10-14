import { User, UserRolesEnum } from '@/core/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateUserRoleService } from './UpdateUserRole.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { createUserFactory } from '../../factories/user.factories';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';

let usersRepository: IUsersRepository;
let hashProvider: IHashProvider;
let service: UpdateUserRoleService;

const { name, surname, email, password, role, status } = createUserFactory({ role: UserRolesEnum.partner });

describe('Update User Role', () => {
	beforeEach(async () => {
		hashProvider = new BcryptHashProvider();
		usersRepository = new UsersRepositoryInMemory();
		service = new UpdateUserRoleService(usersRepository);
	});

	it('Should be able to update the role of a user', async () => {
		const createdPartnerUser = await usersRepository.create({
			name,
			surname,
			email,
			role,
			status,
			password: await hashProvider.hash(password),
		});

		await service.execute({ user_id: createdPartnerUser._id.toString(), role: UserRolesEnum.admin });

		const verifyUser = (await usersRepository.findById(createdPartnerUser._id.toString())) as User;

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
