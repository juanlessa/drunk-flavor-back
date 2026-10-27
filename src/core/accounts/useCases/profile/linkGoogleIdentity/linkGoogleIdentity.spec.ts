import { beforeEach, describe, expect, it } from 'vitest';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { IdentitiesRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Identities.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ConflictError, UnauthorizedError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { NativeDateProvider } from '@/shared/providers/date/implementations/NativeDate.provider';
import { FakeGoogleTokenVerifier } from '@/shared/providers/googleAuth/fakes/FakeGoogleTokenVerifier';
import { LinkGoogleIdentityService } from './LinkGoogleIdentity.service';

let usersRepository: IUsersRepository;
let credentialsRepository: ICredentialsRepository;
let identitiesRepository: IIdentitiesRepository;
let hashProvider: IHashProvider;
let verifier: FakeGoogleTokenVerifier;
let service: LinkGoogleIdentityService;

const currentPassword = 'Current-password-123';

const seedCredentialAccount = async () => {
	const user = await usersRepository.create(createUserFactory({ email: 'local@example.com' }));
	await credentialsRepository.create({
		user_id: user._id.toString(),
		password_hash: await hashProvider.hash(currentPassword),
	});
	return user;
};

describe('LinkGoogleIdentityService', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		credentialsRepository = new CredentialsRepositoryInMemory();
		identitiesRepository = new IdentitiesRepositoryInMemory();
		hashProvider = new BcryptHashProvider();
		verifier = new FakeGoogleTokenVerifier();
		service = new LinkGoogleIdentityService(
			usersRepository,
			credentialsRepository,
			identitiesRepository,
			verifier,
			hashProvider,
			new NativeDateProvider(),
		);
	});

	it('links a verified Google identity after proving the current password', async () => {
		const user = await seedCredentialAccount();

		await service.execute({ userId: user._id.toString(), currentPassword, idToken: 'token' });

		const identity = await identitiesRepository.findByProviderSub(IdentityProviders.google, 'fake-google-sub');
		expect(identity?.user_id).toBe(user._id.toString());
	});

	it('rejects an invalid current password before linking', async () => {
		const user = await seedCredentialAccount();

		await expect(
			service.execute({ userId: user._id.toString(), currentPassword: 'wrong', idToken: 'token' }),
		).rejects.toBeInstanceOf(UnauthorizedError);
		expect(await identitiesRepository.listProvidersByUserId(user._id.toString())).toEqual([]);
	});

	it('rejects a Google identity already owned by another user', async () => {
		const user = await seedCredentialAccount();
		await identitiesRepository.create({
			user_id: '507f1f77bcf86cd799439012',
			provider: IdentityProviders.google,
			provider_sub: 'fake-google-sub',
		});

		await expect(
			service.execute({ userId: user._id.toString(), currentPassword, idToken: 'token' }),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('rejects connecting a second Google identity to the same user', async () => {
		const user = await seedCredentialAccount();
		await identitiesRepository.create({
			user_id: user._id.toString(),
			provider: IdentityProviders.google,
			provider_sub: 'another-google-sub',
		});

		await expect(
			service.execute({ userId: user._id.toString(), currentPassword, idToken: 'token' }),
		).rejects.toBeInstanceOf(ConflictError);
	});
});
