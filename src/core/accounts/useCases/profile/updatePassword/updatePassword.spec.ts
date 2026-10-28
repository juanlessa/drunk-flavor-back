import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { BadRequestError, UnauthorizedError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { ObjectId } from 'mongodb';
import { UpdatePasswordService } from './updatePassword.service';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';

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
	await credentialsRepository.create({ userId: createdUser.id, passwordHash: hashedPassword });
	return { createdUser, hashedPassword };
};

describe('Update Password', () => {
	beforeEach(async () => {
		hashProvider = new BcryptHashProvider();
		usersRepository = new UsersRepositoryInMemory();
		credentialsRepository = new CredentialsRepositoryInMemory();
		service = new UpdatePasswordService(
			usersRepository,
			credentialsRepository,
			hashProvider,
			new FakeTransactionManager(),
		);
	});

	it('Should be able update the password', async () => {
		const { createdUser, hashedPassword } = await seedUserWithCredential();

		await service.execute({
			id: createdUser.id,
			currentPassword: password,
			newPassword: updatedPassword,
		});

		const verifyCredential = await credentialsRepository.findByUserId(createdUser.id);
		expect(verifyCredential).not.toBeNull();
		expect(verifyCredential?.passwordHash).not.toEqual(hashedPassword);
		expect(await hashProvider.compare(updatedPassword, verifyCredential!.passwordHash)).toBe(true);
		expect((await usersRepository.findById(createdUser.id))?.sessionVersion).toBe(createdUser.sessionVersion + 1);
	});

	it('rejects a nonexistent user with an opaque reauthentication error', async () => {
		const nonexistentUserId = new ObjectId().toString();

		await expect(
			service.execute({
				id: nonexistentUserId,
				currentPassword: password,
				newPassword: updatedPassword,
			}),
		).rejects.toBeInstanceOf(UnauthorizedError);
	});

	it('Should not be able to update the password of a user without a credential', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, role, status });

		await expect(
			service.execute({
				id: createdUser.id,
				currentPassword: password,
				newPassword: updatedPassword,
			}),
		).rejects.toBeInstanceOf(UnauthorizedError);
	});

	it('rejects an invalid current password with an opaque reauthentication error', async () => {
		const { createdUser } = await seedUserWithCredential();

		await expect(
			service.execute({
				id: createdUser.id,
				currentPassword: 'invalid-current-password',
				newPassword: updatedPassword,
			}),
		).rejects.toBeInstanceOf(UnauthorizedError);
	});

	it('Should not be able to update if the new password is the same as the current one', async () => {
		const { createdUser } = await seedUserWithCredential();

		await expect(
			service.execute({
				id: createdUser.id,
				currentPassword: password,
				newPassword: password,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
