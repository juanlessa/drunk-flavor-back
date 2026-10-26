import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { ObjectId } from 'mongodb';
import { UpdatePasswordService } from './updatePassword.service';

let hashProvider: IHashProvider;
let usersRepository: IUsersRepository;
let credentialsRepository: ICredentialsRepository;
let service: UpdatePasswordService;

const { name, surname, email, role, status } = createUserFactory();
const password = 'Password-12345678';
const updatedPassword = 'Test-password-1234';

const seedUserWithCredential = async () => {
	const hashedPassword = await hashProvider.hash(password);
	const createdUser = await usersRepository.create({ name, surname, email, role, status });
	await credentialsRepository.create({ user_id: createdUser._id.toString(), password_hash: hashedPassword });
	return { createdUser, hashedPassword };
};

describe('Update Password', () => {
	beforeEach(async () => {
		hashProvider = new BcryptHashProvider();
		usersRepository = new UsersRepositoryInMemory();
		credentialsRepository = new CredentialsRepositoryInMemory();
		service = new UpdatePasswordService(usersRepository, credentialsRepository, hashProvider);
	});

	it('Should be able update the password', async () => {
		const { createdUser, hashedPassword } = await seedUserWithCredential();

		await service.execute({
			id: createdUser._id.toString(),
			currentPassword: password,
			newPassword: updatedPassword,
		});

		const verifyCredential = await credentialsRepository.findByUserId(createdUser._id.toString());
		expect(verifyCredential).not.toBeNull();
		expect(verifyCredential?.password_hash).not.toEqual(hashedPassword);
		expect(await hashProvider.compare(updatedPassword, verifyCredential!.password_hash)).toBe(true);
	});

	it('Should not be able to update the password of a nonexistent user', async () => {
		const nonexistentUserId = new ObjectId().toString();

		await expect(
			service.execute({
				id: nonexistentUserId,
				currentPassword: password,
				newPassword: updatedPassword,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('Should not be able to update the password of a user without a credential', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, role, status });

		await expect(
			service.execute({
				id: createdUser._id.toString(),
				currentPassword: password,
				newPassword: updatedPassword,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('Should not be able to update the password using an invalid current password', async () => {
		const { createdUser } = await seedUserWithCredential();

		await expect(
			service.execute({
				id: createdUser._id.toString(),
				currentPassword: 'invalid-current-password',
				newPassword: updatedPassword,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('Should not be able to update if the new password is the same as the current one', async () => {
		const { createdUser } = await seedUserWithCredential();

		await expect(
			service.execute({
				id: createdUser._id.toString(),
				currentPassword: password,
				newPassword: password,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
