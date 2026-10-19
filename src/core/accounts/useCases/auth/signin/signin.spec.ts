import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { AppError, UnauthorizedError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { SigninService } from './Signin.service';
import { UserStatusEnum } from '@/core/accounts/entities/user.entity';

let usersRepository: IUsersRepository;
let hashProvider: IHashProvider;
let service: SigninService;

const { name, surname, email, password, role, status } = createUserFactory();

describe('Signin', () => {
	beforeEach(async () => {
		usersRepository = new UsersRepositoryInMemory();
		hashProvider = new BcryptHashProvider();
		service = new SigninService(usersRepository, hashProvider);
	});

	it('should be able to signin', async () => {
		await usersRepository.create({
			name,
			surname,
			email,
			password: await hashProvider.hash(password),
			role,
			status,
		});

		const result = await service.execute({
			email,
			password,
		});

		expect(result).toHaveProperty('user');
	});

	it('should reject a nonexistent account with a generic unauthorized error', async () => {
		await expect(service.execute({ email, password })).rejects.toBeInstanceOf(UnauthorizedError);
		await expect(service.execute({ email, password })).rejects.toThrow('apiResponses.auth.invalidCredentials');
	});

	it('should reject a non-active account with the SAME generic unauthorized error', async () => {
		await usersRepository.create({
			name,
			surname,
			email,
			role,
			password: await hashProvider.hash(password),
			status: UserStatusEnum['pending'],
		});

		// Must be indistinguishable from an invalid-credentials failure (no account
		// enumeration): same error type and same external message.
		await expect(service.execute({ email, password })).rejects.toBeInstanceOf(UnauthorizedError);
		await expect(service.execute({ email, password })).rejects.toThrow('apiResponses.auth.invalidCredentials');
	});

	it('should reject an incorrect password with a generic unauthorized error', async () => {
		await usersRepository.create({
			name,
			surname,
			email,
			role,
			status,
			password: await hashProvider.hash(password),
		});

		await expect(service.execute({ email, password: 'incorrectPassword' })).rejects.toBeInstanceOf(
			UnauthorizedError,
		);
		await expect(service.execute({ email, password: 'incorrectPassword' })).rejects.toThrow(
			'apiResponses.auth.invalidCredentials',
		);
	});

	describe('timing equalization (indistinguishability across failure modes)', () => {
		const createActiveUser = async () =>
			usersRepository.create({
				name,
				surname,
				email,
				role,
				status,
				password: await hashProvider.hash(password),
			});

		const createPendingUser = async () =>
			usersRepository.create({
				name,
				surname,
				email,
				role,
				status: UserStatusEnum['pending'],
				password: await hashProvider.hash(password),
			});

		it('runs bcrypt compare exactly once against a non-empty hash for a NONEXISTENT account', async () => {
			const compareSpy = vi.spyOn(hashProvider, 'compare');

			await expect(service.execute({ email, password })).rejects.toBeInstanceOf(UnauthorizedError);

			expect(compareSpy).toHaveBeenCalledTimes(1);
			expect(compareSpy.mock.calls[0][1]).toBeTruthy();
		});

		it('runs bcrypt compare exactly once against a non-empty hash for an INACTIVE account', async () => {
			await createPendingUser();
			const compareSpy = vi.spyOn(hashProvider, 'compare');

			await expect(service.execute({ email, password })).rejects.toBeInstanceOf(UnauthorizedError);

			expect(compareSpy).toHaveBeenCalledTimes(1);
			expect(compareSpy.mock.calls[0][1]).toBeTruthy();
		});

		it('runs bcrypt compare exactly once against a non-empty hash for a WRONG PASSWORD', async () => {
			await createActiveUser();
			const compareSpy = vi.spyOn(hashProvider, 'compare');

			await expect(service.execute({ email, password: 'wrongPassword' })).rejects.toBeInstanceOf(
				UnauthorizedError,
			);

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
		await usersRepository.create({
			name,
			surname,
			email,
			role,
			password: await hashProvider.hash(password),
			status: UserStatusEnum['pending'],
		});

		const error = await service.execute({ email, password }).catch((caught: unknown) => caught);
		expect(error).toBeInstanceOf(AppError);
		expect((error as AppError).message).toBe('apiResponses.auth.invalidCredentials');
		expect((error as AppError).cause).toBe('inactive account');
	});
});
