import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { NativeDateProvider } from '@/shared/providers/date/implementations/NativeDate.provider';
import { ReauthenticatePasswordService } from './ReauthenticatePassword.service';

let usersRepository: UsersRepositoryInMemory;
let credentialsRepository: CredentialsRepositoryInMemory;
let hashProvider: IHashProvider;
let service: ReauthenticatePasswordService;

beforeEach(() => {
	usersRepository = new UsersRepositoryInMemory();
	credentialsRepository = new CredentialsRepositoryInMemory();
	hashProvider = {
		hash: vi.fn(async (value: string) => `hashed:${value}`),
		compare: vi.fn(async (value: string, hash: string) => hash === `hashed:${value}`),
		getDummyHash: vi.fn(async () => 'hashed:dummy-password'),
	};
	service = new ReauthenticatePasswordService(
		usersRepository,
		credentialsRepository,
		hashProvider,
		new NativeDateProvider(),
	);
});

describe('ReauthenticatePasswordService', () => {
	it.each([UserStatuses.active, UserStatuses.incomplete_profile])(
		'accepts a matching credential for a %s user',
		async (status) => {
			const user = await usersRepository.create(createUserFactory({ status }));
			await credentialsRepository.create({ userId: user.id, passwordHash: 'hashed:correct-password' });

			const result = await service.execute({ userId: user.id, password: 'correct-password' });

			expect(result.method).toBe('password');
			expect(result.authenticatedAt).toBeInstanceOf(Date);
			expect(hashProvider.compare).toHaveBeenCalledWith('correct-password', 'hashed:correct-password');
		},
	);

	it('rejects suspended users even when the password matches', async () => {
		const user = await usersRepository.create(createUserFactory({ status: UserStatuses.suspended }));
		await credentialsRepository.create({ userId: user.id, passwordHash: 'hashed:correct-password' });

		await expect(service.execute({ userId: user.id, password: 'correct-password' })).rejects.toBeInstanceOf(
			UnauthorizedError,
		);
	});

	it('rejects an incorrect password', async () => {
		const user = await usersRepository.create(createUserFactory());
		await credentialsRepository.create({ userId: user.id, passwordHash: 'hashed:correct-password' });

		await expect(service.execute({ userId: user.id, password: 'wrong-password' })).rejects.toBeInstanceOf(
			UnauthorizedError,
		);
	});

	it('uses a dummy hash for a missing user to preserve the comparison path', async () => {
		await expect(service.execute({ userId: 'missing-user', password: 'password' })).rejects.toBeInstanceOf(
			UnauthorizedError,
		);
		expect(hashProvider.getDummyHash).toHaveBeenCalledOnce();
		expect(hashProvider.compare).toHaveBeenCalledWith('password', 'hashed:dummy-password');
	});

	it('uses a dummy hash and rejects when the user has no password credential', async () => {
		const user = await usersRepository.create(createUserFactory());

		await expect(service.execute({ userId: user.id, password: 'password' })).rejects.toBeInstanceOf(
			UnauthorizedError,
		);
		expect(hashProvider.getDummyHash).toHaveBeenCalledOnce();
	});
});
