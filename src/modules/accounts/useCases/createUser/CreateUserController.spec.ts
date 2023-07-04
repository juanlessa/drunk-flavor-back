import 'reflect-metadata';
import { ICreateUser } from '@modules/accounts/dtos/Users';
import { UsersRepository } from '@modules/accounts/infra/prisma/repositories/UsersRepository';
import { UsersTokensRepository } from '@modules/accounts/infra/prisma/repositories/UsersTokensRepository';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';
import { ROLES } from '@modules/accounts/types/roles';
import { PrismaClient } from '@prisma/client';
import { DayjsDateProvider } from '@shared/container/providers/date/implementations/DayjsDateProvider';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/BcryptProvider';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/JsonwebtokenProvider';
import { app } from '@shared/infra/http/app';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AuthenticateUserService } from '../authenticateUser/AuthenticateUserService';
import { CreateUserService } from './CreateUserService';

let usersRepository: IUsersRepository;
let usersTokensRepository: IUsersTokensRepository;
let bcryptProvider: BcryptProvider;
let dayjsDateProvider: DayjsDateProvider;
let jsonwebtokenProvider: JsonwebtokenProvider;
let createUserService: CreateUserService;
let authenticateUserService: AuthenticateUserService;
let prismaClient: PrismaClient;

// test constants
const adminUser: ICreateUser = {
	name: 'Admin',
	surname: 'Test',
	email: 'admin@test.com',
	password: 'admin123',
	role: ROLES.admin
};
let adminToken = '';
const partnerUser: ICreateUser = {
	name: 'User',
	surname: 'Test',
	email: 'user@test.com',
	password: '123456789',
	role: ROLES.partner
};

describe('Create user Controller', () => {
	beforeAll(async () => {
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
		prismaClient = new PrismaClient();
	});

	beforeEach(async () => {
		await prismaClient.user.deleteMany();
		await prismaClient.userToken.deleteMany();

		// test constants
		await createUserService.execute(adminUser);
		const authenticateResponse = await authenticateUserService.execute({
			email: adminUser.email,
			password: adminUser.password
		});
		adminToken = authenticateResponse.token.token;
	});

	afterAll(async () => {
		await prismaClient.user.deleteMany();
		await prismaClient.$disconnect();
	});

	it('Should be able to create a user', async () => {
		const response = await request(app)
			.post('/users')
			.send(partnerUser)
			.set('Authorization', `Bearer ${adminToken}`);

		expect(response.status).toBe(201);
	});

	it('Should not be able to create an user with an existing email', async () => {
		await createUserService.execute(partnerUser);

		const response = await request(app)
			.post('/users')
			.send(partnerUser)
			.set('Authorization', `Bearer ${adminToken}`);

		expect(response.status).toBe(400);
	});
});
