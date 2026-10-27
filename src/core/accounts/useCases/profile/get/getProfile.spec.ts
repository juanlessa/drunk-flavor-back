import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { IdentitiesRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Identities.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { GetProfileService } from './GetProfile.service';

let usersRepository: IUsersRepository;
let credentialsRepository: ICredentialsRepository;
let identitiesRepository: IIdentitiesRepository;
let service: GetProfileService;

const userData = createUserFactory();

describe('Get Profile', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		credentialsRepository = new CredentialsRepositoryInMemory();
		identitiesRepository = new IdentitiesRepositoryInMemory();
		service = new GetProfileService(usersRepository, credentialsRepository, identitiesRepository);
	});

	it('returns a provider-only profile without exposing identity details', async () => {
		const user = await usersRepository.create(userData);
		await identitiesRepository.create({
			user_id: user._id.toString(),
			provider: IdentityProviders.google,
			provider_sub: 'google-sub',
		});

		const result = await service.execute({ id: user._id.toString() });

		expect(result.authentication_methods).toEqual({
			password: { enabled: false },
			providers: [IdentityProviders.google],
		});
		expect(result).not.toHaveProperty('password_hash');
		expect(result).not.toHaveProperty('provider_sub');
	});

	it('reports both password and Google for a hybrid account', async () => {
		const user = await usersRepository.create(userData);
		await credentialsRepository.create({ user_id: user._id.toString(), password_hash: 'hash' });
		await identitiesRepository.create({
			user_id: user._id.toString(),
			provider: IdentityProviders.google,
			provider_sub: 'google-sub',
		});

		const result = await service.execute({ id: user._id.toString() });

		expect(result.authentication_methods).toEqual({
			password: { enabled: true },
			providers: [IdentityProviders.google],
		});
	});

	it('rejects a nonexistent profile', async () => {
		await expect(service.execute({ id: new ObjectId().toString() })).rejects.toBeInstanceOf(NotFoundError);
	});
});
