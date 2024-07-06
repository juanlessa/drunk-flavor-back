import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/modules/accounts/repositories/inMemory/Users.repository';
import { BcryptProvider } from '@/shared/providers/encryption/implementations/Bcrypt.provider';
import { AuthenticateUserService } from '@/modules/accounts/useCases/authenticateUser/AuthenticateUser.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { UserRolesEnum } from '@/modules/accounts/entities/user.entity';
import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';

let usersRepositoryInMemory: IUsersRepository;
let encryptionProvider: BcryptProvider;
let service: AuthenticateUserService;

// test constants
const email = 'user@test.com';
const name = 'User';
const surname = 'Test';
const planPassword = '123456789';

describe('Authenticate User', () => {
	beforeEach(async () => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		encryptionProvider = new BcryptProvider();
		service = new AuthenticateUserService(usersRepositoryInMemory, encryptionProvider);
	});

	it('should be able to authenticate an user', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			password: await encryptionProvider.hash(planPassword),
			role: UserRolesEnum.partner,
		});

		const result = await service.execute({
			email: email,
			password: planPassword,
		});

		expect(result).toHaveProperty('user');
	});

	it('should not be able to authenticate an nonexistent user', async () => {
		await expect(service.execute({ email, password: planPassword })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to authenticate an user with incorrect password', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			password: await encryptionProvider.hash(planPassword),
			role: UserRolesEnum.partner,
		});

		await expect(service.execute({ email: email, password: 'incorrectPassword' })).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});
});
