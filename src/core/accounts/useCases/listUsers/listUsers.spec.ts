import { beforeEach, describe, expect, it } from 'vitest';
import { UserRolesEnum } from '@/core/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ListUsersService } from '@/core/accounts/useCases/listUsers/ListUsers.service';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '../../factories/user.factories';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';

let usersRepository: IUsersRepository;
let service: ListUsersService;

const adminUser = createUserFactory({ email: 'admin1@example.com', role: UserRolesEnum.admin });
const createUser1 = createUserFactory({ email: 'partner1@example.com', role: UserRolesEnum.partner });
const createUser2 = createUserFactory({ email: 'partner2@example.com', role: UserRolesEnum.partner });
const createUser3 = createUserFactory({ email: 'member1@example.com', role: UserRolesEnum.member });
const createUser4 = createUserFactory({ email: 'member1@example.com', role: UserRolesEnum.member });

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
		const usersFound = await service.execute({});

		expect(usersFound.length).greaterThan(0);
		expect(usersFound.length).lessThanOrEqual(DEFAULT_QUERY_PARAMS.limit);
	});

	it('should be able to list users using pagination', async () => {
		const usersFound = await service.execute({ query: { page: 1, limit: 3 } });

		expect(usersFound.length).toEqual(3);
	});

	it('should be able to list users using search term', async () => {
		const usersFound = await service.execute({ query: { search: { email: 'part' } } });

		expect(usersFound.length).toEqual(2);
	});

	it('should be able to list users using sort', async () => {
		const usersFound = await service.execute({
			query: { limit: 2, page: 1, sort: { email: -1 } },
		});

		expect(usersFound.length).toEqual(2);
		expect(usersFound[0].email).toEqual(createUser2.email);
		expect(usersFound[1].email).toEqual(createUser1.email);
	});
});
