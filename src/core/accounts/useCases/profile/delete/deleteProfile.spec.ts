import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { TokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Tokens.repository';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { IdentitiesRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Identities.repository';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { DeleteProfileService } from './DeleteProfile.service';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { TokenTypes } from '@/core/accounts/constants/token.constants';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { env } from '@/env';

let cryptoProvider: NodeCryptoProvider;
let usersRepository: IUsersRepository;
let tokensRepository: ITokensRepository;
let credentialsRepository: ICredentialsRepository;
let identitiesRepository: IIdentitiesRepository;
let service: DeleteProfileService;

const userData = createUserFactory();

describe('Delete Profile', () => {
	beforeEach(() => {
		cryptoProvider = new NodeCryptoProvider();
		usersRepository = new UsersRepositoryInMemory();
		tokensRepository = new TokensRepositoryInMemory();
		credentialsRepository = new CredentialsRepositoryInMemory();
		identitiesRepository = new IdentitiesRepositoryInMemory();
		service = new DeleteProfileService(
			usersRepository,
			tokensRepository,
			credentialsRepository,
			identitiesRepository,
			new FakeTransactionManager(),
		);
	});

	it('should be able to delete the profile', async () => {
		const createdUser = await usersRepository.create(userData);

		await service.execute({ id: createdUser._id.toString() });

		const findDeledProfile = await usersRepository.findById(createdUser._id.toString());

		expect(findDeledProfile).toBeNull();
	});

	it('should not be able to delete a nonexistent profile', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should delete the profile together with its tokens, credential and identities', async () => {
		const createdUser = await usersRepository.create(userData);
		const userId = createdUser._id.toString();

		await tokensRepository.create({
			user_id: userId,
			token_hash: await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE),
			type: TokenTypes['forgot-password'],
			expires_at: new Date(Date.now() + 60_000),
		});
		await tokensRepository.create({
			user_id: userId,
			token_hash: await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE),
			type: TokenTypes['email-verification'],
			expires_at: new Date(Date.now() + 60_000),
		});
		await credentialsRepository.create({ user_id: userId, password_hash: 'hashed-password' });
		await identitiesRepository.create({
			user_id: userId,
			provider: IdentityProviders.google,
			provider_sub: 'google-sub-123',
		});

		await service.execute({ id: userId });

		expect(await usersRepository.findById(userId)).toBeNull();
		expect(await tokensRepository.findByUserId(userId)).toHaveLength(0);
		expect(await credentialsRepository.findByUserId(userId)).toBeNull();
		expect(await identitiesRepository.findByUserId(userId)).toHaveLength(0);
	});
});
