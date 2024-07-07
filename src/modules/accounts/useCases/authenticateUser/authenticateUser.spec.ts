import { UsersRepositoryInMemory } from '@modules/accounts/repositories/inMemory/Users.repository';
import { ROLES } from '@modules/accounts/types/roles';
import { DayjsDateProvider } from '@shared/container/providers/date/implementations/DayjsDateProvider';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/Bcrypt.provider';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/Jsonwebtoken.provider';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthenticateUserService } from '@modules/accounts/useCases/authenticateUser/AuthenticateUser.service';
import { BadRequestError } from '@shared/errors/error.lib';

let usersRepositoryInMemory: UsersRepositoryInMemory;
let authenticateUserService: AuthenticateUserService;
let dateProvider: DayjsDateProvider;
let jwtProvider: JsonwebtokenProvider;
let encryptionProvider: BcryptProvider;

// test constants
const email = 'user@test.com';
const name = 'User';
const surname = 'Test';
const planPassword = '123456789';

describe('Authenticate User', () => {
	beforeEach(async () => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		dateProvider = new DayjsDateProvider();
		jwtProvider = new JsonwebtokenProvider();
		encryptionProvider = new BcryptProvider();
		authenticateUserService = new AuthenticateUserService(
			usersRepositoryInMemory,
			dateProvider,
			jwtProvider,
			encryptionProvider
		);
	});

	it('should be able to authenticate an user', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			password: await encryptionProvider.hash(planPassword),
			role: ROLES.partner
		});

		const result = await authenticateUserService.execute({
			email: email,
			password: planPassword
		});

		expect(result).toHaveProperty('accessToken');
		expect(result).toHaveProperty('refreshToken');
	});

	it('should not be able to authenticate an nonexistent user', async () => {
		await expect(
			authenticateUserService.execute({
				email,
				password: planPassword
			})
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to authenticate an user with incorrect password', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			password: await encryptionProvider.hash(planPassword),
			role: ROLES.partner
		});

		await expect(
			authenticateUserService.execute({
				email: email,
				password: 'incorrectPassword'
			})
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
