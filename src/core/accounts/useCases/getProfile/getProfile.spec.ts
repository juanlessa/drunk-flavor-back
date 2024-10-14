import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { NotFoundError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { User } from '@/core/accounts/entities/user.entity';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { GetProfileService } from './GetProfile.service';

let usersRepository: IUsersRepository;
let service: GetProfileService;

const { name, surname, email, password, role, status } = createUserFactory();

describe('Get Profile', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		service = new GetProfileService(usersRepository);
	});

	it('should be able to find the profile', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, password, role, status });

		const result = await service.execute({ id: createdUser._id.toString() });

		expect(result._id).toEqual(createdUser._id);
		expect(result.email).toEqual(createdUser.email);
		expect(result.name).toEqual(createdUser.name);
		expect(result.surname).toEqual(createdUser.surname);
		expect(result.role).toEqual(createdUser.role);
		expect(result).not.toHaveProperty('password');
	});

	it('Should not be able to find a nonexistent profile', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(NotFoundError);
	});
});
