import { User } from '@/core/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { UpdateProfileService } from './UpdateProfile.service';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';

let hashProvider: IHashProvider;
let usersRepository: IUsersRepository;
let service: UpdateProfileService;

const { name, surname, email, password, role, status } = createUserFactory();
const { name: updatedName, surname: updatedSurname } = createUserFactory({ name: 'updated', surname: 'updated' });

describe('Update Profile', () => {
	beforeEach(async () => {
		hashProvider = new BcryptHashProvider();
		usersRepository = new UsersRepositoryInMemory();
		service = new UpdateProfileService(usersRepository);
	});

	it('Should be able to update the profile', async () => {
		const createdUser = await usersRepository.create({
			name,
			surname,
			email,
			role,
			status,
			password: await hashProvider.hash(password),
		});
		await service.execute({
			id: createdUser._id.toString(),
			name: updatedName,
			surname: updatedSurname,
		});

		const verifyUser = (await usersRepository.findById(createdUser._id.toString())) as User;

		expect(verifyUser).toBeDefined();
		expect(verifyUser.name).toEqual(updatedName);
		expect(verifyUser.surname).toEqual(updatedSurname);
	});

	it('should not be able to update a nonexistent profile', async () => {
		const nonexistentUserId = new ObjectId().toString();
		await expect(
			service.execute({
				id: nonexistentUserId,
				name: updatedName,
				surname: updatedSurname,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
