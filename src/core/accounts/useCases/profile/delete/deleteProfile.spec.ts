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
import { OwnerManagementRequiresTransferError } from '@/core/accounts/errors/user.errors';
import { Roles } from '@/shared/accessControl/roles';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';

let cryptoProvider: NodeCryptoProvider;
let usersRepository: IUsersRepository;
let tokensRepository: ITokensRepository;
let credentialsRepository: ICredentialsRepository;
let identitiesRepository: IIdentitiesRepository;
let storageProvider: IStorageProvider;
let service: DeleteProfileService;

const userData = createUserFactory();

describe('Delete Profile', () => {
	beforeEach(() => {
		cryptoProvider = new NodeCryptoProvider();
		usersRepository = new UsersRepositoryInMemory();
		tokensRepository = new TokensRepositoryInMemory();
		credentialsRepository = new CredentialsRepositoryInMemory();
		identitiesRepository = new IdentitiesRepositoryInMemory();
		storageProvider = new MockStorageProvider();
		service = new DeleteProfileService(
			usersRepository,
			tokensRepository,
			credentialsRepository,
			identitiesRepository,
			new FakeTransactionManager(),
			storageProvider,
		);
	});

	it('should be able to delete the profile', async () => {
		const createdUser = await usersRepository.create(userData);

		await service.execute({ id: createdUser.id });

		const findDeledProfile = await usersRepository.findById(createdUser.id);

		expect(findDeledProfile).toBeNull();
	});

	it('should not be able to delete a nonexistent profile', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should delete the profile together with its tokens, credential and identities', async () => {
		const createdUser = await usersRepository.create(userData);
		const userId = createdUser.id;

		await tokensRepository.create({
			userId: userId,
			tokenHash: await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE),
			type: TokenTypes['forgot-password'],
			expiresAt: new Date(Date.now() + 60_000),
		});
		await tokensRepository.create({
			userId: userId,
			tokenHash: await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE),
			type: TokenTypes['email-verification'],
			expiresAt: new Date(Date.now() + 60_000),
		});
		await credentialsRepository.create({ userId: userId, passwordHash: 'hashed-password' });
		await identitiesRepository.create({
			userId: userId,
			provider: IdentityProviders.google,
			providerSubject: 'google-sub-123',
		});

		await service.execute({ id: userId });

		expect(await usersRepository.findById(userId)).toBeNull();
		expect(await tokensRepository.findByUserId(userId)).toHaveLength(0);
		expect(await credentialsRepository.findByUserId(userId)).toBeNull();
		expect(await identitiesRepository.findByUserId(userId)).toHaveLength(0);
	});

	it('deletes a server-managed avatar after the account transaction succeeds', async () => {
		const createdUser = await usersRepository.create(userData);
		const userId = createdUser.id;
		const avatarName = `0123456789abcdef0123456789abcdef-${userId}-avatar.png`;
		await usersRepository.update({ id: userId, avatarUrl: `https://cdn.example.com/${avatarName}` });

		await service.execute({ id: userId });

		expect(storageProvider.deleteFile).toHaveBeenCalledWith(avatarName);
	});

	it('does not send an external provider avatar to storage deletion', async () => {
		const createdUser = await usersRepository.create({
			...userData,
			avatarUrl: 'https://accounts.example.com/avatar.png',
		});

		await service.execute({ id: createdUser.id });

		expect(storageProvider.deleteFile).not.toHaveBeenCalled();
	});

	it('does not let the owner delete their own profile', async () => {
		const owner = await usersRepository.create(createUserFactory({ role: Roles.owner }));

		await expect(service.execute({ id: owner.id })).rejects.toBeInstanceOf(OwnerManagementRequiresTransferError);

		expect(await usersRepository.findById(owner.id)).not.toBeNull();
		expect(storageProvider.deleteFile).not.toHaveBeenCalled();
	});
});
