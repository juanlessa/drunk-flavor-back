import { ICreateUser } from '@modules/accounts/dtos/user.dtos';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { ROLES } from '@modules/accounts/types/roles';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/Bcrypt.provider';
import { app } from '@shared/infra/http/app';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { User } from '@modules/accounts/infra/mongo/entities/user.model';
import { MongoRepository } from '@shared/infra/mongo/Mongo.repository';
import { resolveUsersRepository } from '@modules/accounts/container';
import { resolveEncryptionProvider } from '@shared/container/providers/encryption';

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

describe('Authenticate User', () => {
	beforeAll(async () => {
		usersRepository = resolveUsersRepository();
		encryptionProvider = resolveEncryptionProvider();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(User);
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
	});
});
