import { ICreateUser } from '@modules/accounts/dtos/user.dtos';
import { UsersRepository } from '@modules/accounts/infra/mongo/repositories/Users.repository';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { ROLES } from '@modules/accounts/types/roles';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/Bcrypt.provider';
import { app } from '@shared/infra/http/app';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { UserToken } from '@modules/accounts/infra/mongo/entities/userToken.model';
import { User } from '@modules/accounts/infra/mongo/entities/user.model';
import { dropCollection, emptyCollection, initiateMongo } from '@shared/infra/mongo';

let usersRepository: IUsersRepository;
let encryptionProvider: BcryptProvider;

// test constants
const userTest: ICreateUser = {
	name: 'Admin',
	surname: 'Test',
	email: 'admin@test.com',
	password: 'admin123',
	role: ROLES.partner
};

describe('Authenticate User Controller', () => {
	beforeAll(async () => {
		usersRepository = new UsersRepository();
		encryptionProvider = new BcryptProvider();

		await initiateMongo();
	});

	beforeEach(async () => {
		await emptyCollection(User);
		await emptyCollection(UserToken);
	});

	afterAll(async () => {
		await dropCollection(User);
		await dropCollection(UserToken);
	});

	it('should be able to authenticate an user', async () => {
		await usersRepository.create({
			...userTest,
			password: await encryptionProvider.hash(userTest.password)
		});

		const response = await request(app)
			.post('/sessions')
			.send({ email: userTest.email, password: userTest.password });

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('token');
	});

	it('should not be able to authenticate an nonexistent user', async () => {
		const response = await request(app)
			.post('/sessions')
			.send({ email: 'invalid.email@test.com', password: userTest.password });

		expect(response.status).toBe(400);
	});

	it('should not be able to authenticate an user with incorrect password', async () => {
		await usersRepository.create({
			...userTest,
			password: await encryptionProvider.hash(userTest.password)
		});

		const response = await request(app)
			.post('/sessions')
			.send({ email: userTest.email, password: 'incorrectPassword' });

		expect(response.status).toBe(400);
	});
});
