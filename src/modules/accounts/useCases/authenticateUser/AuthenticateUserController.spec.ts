import 'reflect-metadata';
import { ICreateUser } from '@modules/accounts/dtos/Users';
import { UsersRepository } from '@modules/accounts/infra/prisma/repositories/UsersRepository';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { ROLES } from '@modules/accounts/types/roles';
import { CreateUserService } from '@modules/accounts/useCases/createUser/CreateUserService';
import { PrismaClient } from '@prisma/client';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/BcryptProvider';
import { app } from '@shared/infra/http/app';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

let usersRepository: IUsersRepository;
let bcryptProvider: BcryptProvider;
let createUserService: CreateUserService;
let prismaClient: PrismaClient;

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

		bcryptProvider = new BcryptProvider();
		createUserService = new CreateUserService(usersRepository, bcryptProvider);
		prismaClient = new PrismaClient();
	});

	beforeEach(async () => {
		await prismaClient.user.deleteMany();
		await prismaClient.userToken.deleteMany();

		// test constants
		await createUserService.execute(userTest);
	});

	afterAll(async () => {
		await prismaClient.user.deleteMany();
		await prismaClient.userToken.deleteMany();
		await prismaClient.$disconnect();
	});

	it('should be able to authenticate an user', async () => {
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
		const response = await request(app)
			.post('/sessions')
			.send({ email: userTest.email, password: 'incorrectPassword' });

		expect(response.status).toBe(400);
	});
});
