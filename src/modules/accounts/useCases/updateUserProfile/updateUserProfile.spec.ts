import { User, UserRolesEnum } from '@/modules/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/modules/accounts/repositories/inMemory/Users.repository';
import { BcryptProvider } from '@/shared/providers/encryption/implementations/Bcrypt.provider';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateUserProfileService } from './UpdateUserProfile.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';

let usersRepositoryInMemory: IUsersRepository;
let encryptionProvider: BcryptProvider;
let service: UpdateUserProfileService;

// test constants
const planPassword = '123456789';
const email = 'user@test.com';
const name = 'User';
const surname = 'Test';
const role = UserRolesEnum.admin;
const updatedName = 'New';
const updatedSurname = 'User';
const updatedEmail = 'new.user@test.com';
const updatedPlanPassword = '987654321';

describe('Update User', () => {
	beforeEach(async () => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		encryptionProvider = new BcryptProvider();
		service = new UpdateUserProfileService(usersRepositoryInMemory, encryptionProvider);
	});

	it('Should be able to update an user', async () => {
		const createdUser = await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			role,
			password: await encryptionProvider.hash(planPassword),
		});
		await service.execute({
			id: createdUser._id.toString(),
			name: updatedName,
			surname: updatedSurname,
			email: updatedEmail,
			password: updatedPlanPassword,
		});

		const verifyUser = (await usersRepositoryInMemory.findById(createdUser._id.toString())) as User;

		expect(verifyUser.email).toEqual(updatedEmail);
		expect(verifyUser.name).toEqual(updatedName);
		expect(verifyUser.surname).toEqual(updatedSurname);
		expect(verifyUser).toHaveProperty('_id');
		expect(verifyUser).toHaveProperty('created_at');
	});

	it('Should not be able to update the user email to another email already in use', async () => {
		const createdUser = await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			role,
			password: await encryptionProvider.hash(planPassword),
		});
		await usersRepositoryInMemory.create({
			name: updatedName,
			surname: updatedSurname,
			email: updatedEmail,
			role,
			password: await encryptionProvider.hash(updatedPlanPassword),
		});

		await expect(
			service.execute({
				id: createdUser._id.toString(),
				name: updatedName,
				surname: updatedSurname,
				email: updatedEmail,
				password: updatedPlanPassword,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update a nonexistent user', async () => {
		const nonexistentUserId = new ObjectId().toString();
		await expect(
			service.execute({
				id: nonexistentUserId,
				name: updatedName,
				surname: updatedSurname,
				email: updatedEmail,
				password: updatedPlanPassword,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
