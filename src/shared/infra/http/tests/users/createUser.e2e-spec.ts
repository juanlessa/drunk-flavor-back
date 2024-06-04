import { resolveAuthenticateUserService } from '@modules/accounts/useCases/authenticateUser/authenticateUser.container';
import { ICreateUser } from '@modules/accounts/dtos/user.dtos';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { ROLES } from '@modules/accounts/types/roles';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/Bcrypt.provider';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/Jsonwebtoken.provider';
import { app } from '@shared/infra/http/app';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AuthenticateUserService } from '@modules/accounts/useCases/authenticateUser/AuthenticateUser.service';
import { User } from '@modules/accounts/infra/mongo/entities/user.model';
import { MongoRepository } from '@shared/infra/mongo/Mongo.repository';
import { resolveJwtProvider } from '@shared/container/providers/jwt';
import { resolveUsersRepository } from '@modules/accounts/container';
import { HTTP_STATUS } from '@shared/constants/httpStatus';

let usersRepository: IUsersRepository;
let encryptionProvider: BcryptProvider;
let jwtProvider: JsonwebtokenProvider;
let authenticateUserService: AuthenticateUserService;

// test constants
const adminUser: ICreateUser = {
	name: 'Admin',
	surname: 'Test',
	email: 'admin@test.com',
	password: 'admin123',
	role: ROLES.admin
};
const partnerUser: ICreateUser = {
	name: 'User',
	surname: 'Test',
	email: 'user@test.com',
	password: '123456789',
	role: ROLES.partner
};

describe('Create user Controller', () => {
	beforeAll(async () => {
		usersRepository = resolveUsersRepository();
		encryptionProvider = new BcryptProvider();
		jwtProvider = resolveJwtProvider();
		authenticateUserService = resolveAuthenticateUserService();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(User);
	});

	it('Should be able to create a user', async () => {
		await usersRepository.create({
			...adminUser,
			password: await encryptionProvider.hash(adminUser.password)
		});
		const authenticateResponse = await authenticateUserService.execute({
			email: adminUser.email,
			password: adminUser.password
		});
		const adminToken = authenticateResponse.accessToken;

		const response = await request(app)
			.post('/users')
			.send(partnerUser)
			.set('Authorization', `Bearer ${adminToken}`);

		expect(response.status).toBe(HTTP_STATUS.created);
	});
});
