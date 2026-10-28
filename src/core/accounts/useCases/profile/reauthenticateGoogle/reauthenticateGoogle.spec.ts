import { beforeEach, describe, expect, it } from 'vitest';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IdentitiesRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Identities.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { NativeDateProvider } from '@/shared/providers/date/implementations/NativeDate.provider';
import { FakeGoogleTokenVerifier } from '@/shared/providers/googleAuth/fakes/FakeGoogleTokenVerifier';
import { ReauthenticateGoogleService } from './ReauthenticateGoogle.service';

let usersRepository: IUsersRepository;
let identitiesRepository: IIdentitiesRepository;
let verifier: FakeGoogleTokenVerifier;
let dateProvider: IDateProvider;
let service: ReauthenticateGoogleService;

describe('ReauthenticateGoogleService', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		identitiesRepository = new IdentitiesRepositoryInMemory();
		verifier = new FakeGoogleTokenVerifier();
		dateProvider = new NativeDateProvider();
		service = new ReauthenticateGoogleService(verifier, usersRepository, identitiesRepository, dateProvider);
	});

	it('accepts a recent token for the Google identity linked to the current user', async () => {
		const user = await usersRepository.create(createUserFactory());
		await identitiesRepository.create({
			userId: user.id,
			provider: IdentityProviders.google,
			providerSubject: 'fake-google-sub',
		});
		verifier.setNextIdentity({
			subject: 'fake-google-sub',
			isEmailVerified: true,
			issuedAt: new Date(),
		});

		const result = await service.execute({ userId: user.id, idToken: 'valid-token' });

		expect(result.method).toBe(IdentityProviders.google);
		expect(result.authenticatedAt).toBeInstanceOf(Date);
	});

	it('rejects an old Google token', async () => {
		const user = await usersRepository.create(createUserFactory());
		await identitiesRepository.create({
			userId: user.id,
			provider: IdentityProviders.google,
			providerSubject: 'fake-google-sub',
		});
		verifier.setNextIdentity({
			subject: 'fake-google-sub',
			isEmailVerified: true,
			issuedAt: new Date(Date.now() - 10 * 60 * 1000),
		});

		await expect(service.execute({ userId: user.id, idToken: 'old-token' })).rejects.toBeInstanceOf(
			UnauthorizedError,
		);
	});

	it('rejects a valid Google identity linked to another user', async () => {
		const user = await usersRepository.create(createUserFactory());
		await identitiesRepository.create({
			userId: '507f1f77bcf86cd799439012',
			provider: IdentityProviders.google,
			providerSubject: 'fake-google-sub',
		});

		await expect(service.execute({ userId: user.id, idToken: 'valid-token' })).rejects.toBeInstanceOf(
			UnauthorizedError,
		);
	});

	it('rejects an unlinked Google identity', async () => {
		const user = await usersRepository.create(createUserFactory());

		await expect(service.execute({ userId: user.id, idToken: 'valid-token' })).rejects.toBeInstanceOf(
			UnauthorizedError,
		);
	});
});
