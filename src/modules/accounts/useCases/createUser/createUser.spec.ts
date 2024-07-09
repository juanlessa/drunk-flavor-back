import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/modules/accounts/repositories/inMemory/Users.repository';
import { BcryptProvider } from '@/shared/providers/encryption/implementations/Bcrypt.provider';
import { CreateUserService } from '@/modules/accounts/useCases/createUser/CreateUser.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/modules/accounts/container';

let usersRepositoryInMemory: IUsersRepository;
let encryptionProvider: BcryptProvider;
let service: CreateUserService;

const { name, surname, email, password, role } = createUserFactory();

describe('Create User', () => {
	beforeEach(async () => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		encryptionProvider = new BcryptProvider();
		service = new CreateUserService(usersRepositoryInMemory, encryptionProvider);
	});

	it('Should be able to create a user', async () => {
		await service.execute({ name, surname, email, password, role });

		const verifyUser = await usersRepositoryInMemory.findByEmail(email);

		expect(verifyUser).not.toBeNull();
		expect(verifyUser?.email).toEqual(email);
		expect(verifyUser?.name).toEqual(name);
		expect(verifyUser?.surname).toEqual(surname);
		expect(verifyUser).toHaveProperty('_id');
		expect(verifyUser).toHaveProperty('created_at');
		expect(verifyUser).toHaveProperty('updated_at');
	});

	it('Should not be able to create a user with an existing email', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			role,
			password: await encryptionProvider.hash(password),
		});

		await expect(service.execute({ name, surname, email, password, role })).rejects.toBeInstanceOf(BadRequestError);
	});
});
