import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { AppError, UnauthorizedError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { SigninService } from './Signin.service';
import { UserStatuses } from '@/core/accounts/constants/user.constants';

let usersRepository: IUsersRepository;
let credentialsRepository: ICredentialsRepository;
let hashProvider: IHashProvider;
let service: SigninService;

const { name, surname, email, role, status } = createUserFactory();
const password = 'Password-12345678';

const seedUserWithCredential = async (userStatus = status) => {
	const user = await usersRepository.create({ name, surname, email, role, status: userStatus });
	await credentialsRepository.create({
		userId: user.id,
		passwordHash: await hashProvider.hash(password),
	});
	return user;
};

describe('Signin', () => {
	beforeEach(async () => {
		usersRepository = new UsersRepositoryInMemory();
		credentialsRepository = new CredentialsRepositoryInMemory();
		hashProvider = new BcryptHashProvider();
		service = new SigninService(usersRepository, credentialsRepository, hashProvider);
	});

	it('should be able to signin', async () => {
		await seedUserWithCredential();

		const result = await service.execute({
			email,
			password,
		});

		expect(result).toHaveProperty('user');
		expect(result.user.status).toBe(UserStatuses.active);
		expect(result.user.sessionVersion).toBe(1);
	});

	it('should reject a nonexistent account with a generic unauthorized error', async () => {
		await expect(service.execute({ email, password })).rejects.toBeInstanceOf(UnauthorizedError);
		await expect(service.execute({ email, password })).rejects.toThrow('apiResponses.auth.invalidCredentials');
	});

	it('should reject a non-active account with the SAME generic unauthorized error', async () => {
		await seedUserWithCredential(UserStatuses['pending']);

		// Must be indistinguishable from an invalid-credentials failure (no account
		// enumeration): same error type and same external message.
		await expect(service.execute({ email, password })).rejects.toBeInstanceOf(UnauthorizedError);
		await expect(service.execute({ email, password })).rejects.toThrow('apiResponses.auth.invalidCredentials');
	});

	it('should reject an incorrect password with a generic unauthorized error', async () => {
		await seedUserWithCredential();

		await expect(service.execute({ email, password: 'incorrectPassword' })).rejects.toBeInstanceOf(
			UnauthorizedError,
		);
		await expect(service.execute({ email, password: 'incorrectPassword' })).rejects.toThrow(
			'apiResponses.auth.invalidCredentials',
		);
	});

	it('should reject an active user with NO credential exactly like a nonexistent account', async () => {
		// A Google-only account has no credentials document. It must be
		// indistinguishable from a nonexistent account.
		await usersRepository.create({ name, surname, email, role, status });

		await expect(service.execute({ email, password })).rejects.toBeInstanceOf(UnauthorizedError);
		await expect(service.execute({ email, password })).rejects.toThrow('apiResponses.auth.invalidCredentials');
	});

	describe('timing equalization (indistinguishability across failure modes)', () => {
		it('runs bcrypt compare exactly once against a non-empty hash for a NONEXISTENT account', async () => {
			const compareSpy = vi.spyOn(hashProvider, 'compare');

			await expect(service.execute({ email, password })).rejects.toBeInstanceOf(UnauthorizedError);

			expect(compareSpy).toHaveBeenCalledTimes(1);
			expect(compareSpy.mock.calls[0][1]).toBeTruthy();
		});

		it('runs bcrypt compare exactly once against a non-empty hash for an INACTIVE account', async () => {
			await seedUserWithCredential(UserStatuses['pending']);
			const compareSpy = vi.spyOn(hashProvider, 'compare');

			await expect(service.execute({ email, password })).rejects.toBeInstanceOf(UnauthorizedError);

			expect(compareSpy).toHaveBeenCalledTimes(1);
			expect(compareSpy.mock.calls[0][1]).toBeTruthy();
		});

		it('runs bcrypt compare exactly once against a non-empty hash for a WRONG PASSWORD', async () => {
			await seedUserWithCredential();
			const compareSpy = vi.spyOn(hashProvider, 'compare');

			await expect(service.execute({ email, password: 'wrongPassword' })).rejects.toBeInstanceOf(
				UnauthorizedError,
			);

			expect(compareSpy).toHaveBeenCalledTimes(1);
			expect(compareSpy.mock.calls[0][1]).toBeTruthy();
		});

		it('runs bcrypt compare exactly once against a non-empty hash for a MISSING CREDENTIAL', async () => {
			await usersRepository.create({ name, surname, email, role, status });
			const compareSpy = vi.spyOn(hashProvider, 'compare');

			await expect(service.execute({ email, password })).rejects.toBeInstanceOf(UnauthorizedError);

			expect(compareSpy).toHaveBeenCalledTimes(1);
			expect(compareSpy.mock.calls[0][1]).toBeTruthy();
		});

		it('uses the provider dummy hash (not an empty value) on the nonexistent-account path', async () => {
			const dummyHash = await hashProvider.getDummyHash();
			const compareSpy = vi.spyOn(hashProvider, 'compare');

			await expect(service.execute({ email, password })).rejects.toBeInstanceOf(UnauthorizedError);

			expect(compareSpy.mock.calls[0][1]).toBe(dummyHash);
		});
	});

	it('should carry the real reason internally (in cause) while keeping the message generic', async () => {
		await seedUserWithCredential(UserStatuses['pending']);

		const error = await service.execute({ email, password }).catch((caught: unknown) => caught);
		expect(error).toBeInstanceOf(AppError);
		expect((error as AppError).message).toBe('apiResponses.auth.invalidCredentials');
		expect((error as AppError).cause).toBe('inactive account');
	});
});
