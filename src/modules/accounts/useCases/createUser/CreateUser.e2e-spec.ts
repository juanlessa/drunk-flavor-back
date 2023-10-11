import 'reflect-metadata';
import { ICreateUser } from '@modules/accounts/dtos/user.dtos';
import { UsersRepository } from '@modules/accounts/infra/mongo/repositories/Users.repository';
import { UsersTokensRepository } from '@modules/accounts/infra/mongo/repositories/UsersTokens.repository';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokens.repository';
import { ROLES } from '@modules/accounts/types/roles';
import { DayjsDateProvider } from '@shared/container/providers/date/implementations/DayjsDateProvider';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/Bcrypt.provider';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/Jsonwebtoken.provider';
import { app } from '@shared/infra/http/app';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AuthenticateUserService } from '../authenticateUser/AuthenticateUser.service';
import { CreateUserService } from './CreateUser.service';
import { closeConnection, dropCollection, emptyCollection, initiateMongo } from '@shared/infra/database/mongo';
import { UserToken } from '@modules/accounts/infra/mongo/entities/userToken.model';
import { User } from '@modules/accounts/infra/mongo/entities/user.model';
import auth from '@config/auth';

let usersRepository: IUsersRepository;
let usersTokensRepository: IUsersTokensRepository;
let bcryptProvider: BcryptProvider;
let dayjsDateProvider: DayjsDateProvider;
let jsonwebtokenProvider: JsonwebtokenProvider;
let createUserService: CreateUserService;
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
		await initiateMongo();

		usersRepository = new UsersRepository();
		usersTokensRepository = new UsersTokensRepository();
		bcryptProvider = new BcryptProvider();
		dayjsDateProvider = new DayjsDateProvider();
		jsonwebtokenProvider = new JsonwebtokenProvider();
		createUserService = new CreateUserService(usersRepository, bcryptProvider);
		authenticateUserService = new AuthenticateUserService(
			usersRepository,
			usersTokensRepository,
			dayjsDateProvider,
			jsonwebtokenProvider,
			bcryptProvider
		);
	});

	beforeEach(async () => {
		await emptyCollection(User);
		await emptyCollection(UserToken);
	});

	afterAll(async () => {
		await dropCollection(User);
		await dropCollection(UserToken);
		await closeConnection();
	});

	it('Should be able to create a user', async () => {
		await createUserService.execute(adminUser);
		const authenticateResponse = await authenticateUserService.execute({
			email: adminUser.email,
			password: adminUser.password
		});
		const adminToken = authenticateResponse.token.token;

		const response = await request(app)
			.post('/users')
			.send(partnerUser)
			.set('Authorization', `Bearer ${adminToken}`);

		expect(response.status).toBe(201);
	});

	it('Should not be able to create an user with an existing email', async () => {
		await createUserService.execute(adminUser);
		const authenticateResponse = await authenticateUserService.execute({
			email: adminUser.email,
			password: adminUser.password
		});
		const adminToken = authenticateResponse.token.token;

		await createUserService.execute(partnerUser);

		const response = await request(app)
			.post('/users')
			.send(partnerUser)
			.set('Authorization', `Bearer ${adminToken}`);

		expect(response.status).toBe(400);
	});

	it('Should not be able to create a user without being authenticated', async () => {
		const invalidUserToken = jsonwebtokenProvider.createToken({
			subject: '',
			secret: 'incorrect secret token',
			expires_in: auth.expires_in_token
		});

		const response = await request(app)
			.post('/users')
			.send(partnerUser)
			.set('Authorization', `Bearer ${invalidUserToken}`);

		expect(response.status).toBe(401);
	});

	it('Should not be able to create a user without being admin', async () => {
		await createUserService.execute(partnerUser);
		const authenticateResponse = await authenticateUserService.execute({
			email: partnerUser.email,
			password: partnerUser.password
		});
		const partnerToken = authenticateResponse.token.token;

		const response = await request(app)
			.post('/users')
			.send(partnerUser)
			.set('Authorization', `Bearer ${partnerToken}`);

		expect(response.status).toBe(403);
	});
});
