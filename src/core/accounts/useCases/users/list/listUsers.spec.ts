import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ListUsersService } from './ListUsers.service';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { Roles } from '@/shared/accessControl/roles';
import { Actor } from '@/shared/accessControl/actor.types';
import { ForbiddenError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';

let usersRepository: IUsersRepository;
let service: ListUsersService;

const admin: Actor = { id: new ObjectId().toString(), role: Roles.admin };
const member: Actor = { id: new ObjectId().toString(), role: Roles.member };

const adminUser = createUserFactory({ email: 'admin1@example.com', role: Roles.admin });
const createUser1 = createUserFactory({ email: 'partner1@example.com', role: Roles.partner });
const createUser2 = createUserFactory({ email: 'partner2@example.com', role: Roles.partner });
const createUser3 = createUserFactory({ email: 'member1@example.com', role: Roles.member });
const createUser4 = createUserFactory({ email: 'member1@example.com', role: Roles.member });

describe('List Users', () => {
	beforeEach(async () => {
		usersRepository = new UsersRepositoryInMemory();
		service = new ListUsersService(usersRepository);

		await usersRepository.create(adminUser);
		await usersRepository.create(createUser1);
		await usersRepository.create(createUser2);
		await usersRepository.create(createUser3);
		await usersRepository.create(createUser4);
	});

	it('should be able to list users', async () => {
		const usersFound = await service.execute({ actor: admin });

		expect(usersFound.length).greaterThan(0);
		expect(usersFound.length).lessThanOrEqual(DEFAULT_QUERY_PARAMS.limit);
	});

	it('should be able to list users using pagination', async () => {
		const usersFound = await service.execute({ query: { page: 1, limit: 3 }, actor: admin });

		expect(usersFound.length).toEqual(3);
	});

	it('should be able to list users using search term', async () => {
		const usersFound = await service.execute({ query: { search: { email: 'part' } }, actor: admin });

		expect(usersFound.length).toEqual(2);
	});

	it('should be able to list users using sort', async () => {
		const usersFound = await service.execute({
			query: { limit: 2, page: 1, sort: { email: -1 } },
			actor: admin,
		});

		expect(usersFound.length).toEqual(2);
		expect(usersFound[0].email).toEqual(createUser2.email);
		expect(usersFound[1].email).toEqual(createUser1.email);
	});

	it('should not be able to list users when the actor is a member', async () => {
		await expect(service.execute({ actor: member })).rejects.toBeInstanceOf(ForbiddenError);
	});
});
