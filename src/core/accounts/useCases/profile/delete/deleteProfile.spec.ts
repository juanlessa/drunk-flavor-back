import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { NotFoundError } from '@/shared/error/error.lib';
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
import { CLEANUP_JOB_NAMES } from '@/shared/providers/queue/cleanup/cleanupQueue.constants';
import { MockCleanupQueueProvider } from '@/shared/providers/queue/cleanup/implementations/MockCleanupQueue.provider';
import { AdministrativeEventsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/AdministrativeEvents.repository';
import { AdministrativeEventActions } from '@/core/accounts/constants/administrativeEvent.constants';
import { SessionVersionMarkerStoreInMemory } from '@/core/accounts/stores/inMemory/SessionVersionMarker.store';

let cryptoProvider: NodeCryptoProvider;
let usersRepository: IUsersRepository;
let tokensRepository: ITokensRepository;
let credentialsRepository: ICredentialsRepository;
let identitiesRepository: IIdentitiesRepository;
let cleanupQueueProvider: MockCleanupQueueProvider;
let administrativeEventsRepository: AdministrativeEventsRepositoryInMemory;
let service: DeleteProfileService;

const userData = createUserFactory();

describe('Delete Profile', () => {
	beforeEach(() => {
		cryptoProvider = new NodeCryptoProvider();
		usersRepository = new UsersRepositoryInMemory();
		tokensRepository = new TokensRepositoryInMemory();
		credentialsRepository = new CredentialsRepositoryInMemory();
		identitiesRepository = new IdentitiesRepositoryInMemory();
		cleanupQueueProvider = new MockCleanupQueueProvider();
		administrativeEventsRepository = new AdministrativeEventsRepositoryInMemory();
		service = new DeleteProfileService(
			usersRepository,
			tokensRepository,
			credentialsRepository,
			identitiesRepository,
			new FakeTransactionManager(),
			administrativeEventsRepository,
			new SessionVersionMarkerStoreInMemory(),
			cleanupQueueProvider,
		);
	});

	it('deletes the profile and records the closure', async () => {
		const createdUser = await usersRepository.create(userData);

		await service.execute({ id: createdUser.id });

		const findDeledProfile = await usersRepository.findById(createdUser.id);

		expect(findDeledProfile).toBeNull();
		expect(administrativeEventsRepository.collection).toEqual([
			expect.objectContaining({
				actorId: createdUser.id,
				targetUserId: createdUser.id,
				action: AdministrativeEventActions.userClosed,
				before: { role: createdUser.role, status: createdUser.status },
			}),
		]);
	});

	it('rejects a nonexistent profile', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(NotFoundError);
	});

	it('deletes the tokens, credential, and identities of the profile', async () => {
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

	it('enqueues the removal of a server-managed avatar after the account transaction succeeds', async () => {
		const createdUser = await usersRepository.create(userData);
		const userId = createdUser.id;
		const avatarName = `0123456789abcdef0123456789abcdef-${userId}-avatar.png`;
		await usersRepository.update({ id: userId, avatarUrl: `https://cdn.example.com/${avatarName}` });

		await service.execute({ id: userId });

		expect(cleanupQueueProvider.addMock).toHaveBeenCalledWith(
			CLEANUP_JOB_NAMES.deleteStorageFile,
			{ fileName: avatarName },
			{ deduplicationKey: `delete-storage-file-${avatarName}` },
		);
	});

	it('does not enqueue the removal of an external provider avatar', async () => {
		const createdUser = await usersRepository.create({
			...userData,
			avatarUrl: 'https://accounts.example.com/avatar.png',
		});

		await service.execute({ id: createdUser.id });

		expect(cleanupQueueProvider.addMock).not.toHaveBeenCalledWith(
			CLEANUP_JOB_NAMES.deleteStorageFile,
			expect.anything(),
			expect.anything(),
		);
	});

	it('does not let the owner delete their own profile', async () => {
		const owner = await usersRepository.create(createUserFactory({ role: Roles.owner }));

		await expect(service.execute({ id: owner.id })).rejects.toBeInstanceOf(OwnerManagementRequiresTransferError);

		expect(await usersRepository.findById(owner.id)).not.toBeNull();
		expect(cleanupQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('enqueues the catalog and comment cleanup after deleting the profile', async () => {
		const createdUser = await usersRepository.create(userData);
		await service.execute({ id: createdUser.id });
		expect(cleanupQueueProvider.addMock).toHaveBeenCalledWith(
			CLEANUP_JOB_NAMES.clearCatalogAuthorship,
			{ userId: createdUser.id },
			{ deduplicationKey: `clear-catalog-authorship-${createdUser.id}` },
		);
		expect(cleanupQueueProvider.addMock).toHaveBeenCalledWith(
			CLEANUP_JOB_NAMES.deleteComments,
			{ userId: createdUser.id },
			{ deduplicationKey: `delete-comments-${createdUser.id}` },
		);
	});

	it('does not enqueue any cleanup when the profile does not exist', async () => {
		await expect(service.execute({ id: new ObjectId().toString() })).rejects.toBeInstanceOf(NotFoundError);
		expect(cleanupQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('keeps the deletion when a cleanup job cannot be enqueued', async () => {
		const createdUser = await usersRepository.create(userData);
		cleanupQueueProvider.addMock.mockRejectedValueOnce(new Error('queue unavailable'));
		await expect(service.execute({ id: createdUser.id })).resolves.toBeUndefined();
		expect(await usersRepository.findById(createdUser.id)).toBeNull();
	});
});
