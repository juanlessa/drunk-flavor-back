import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ObjectId } from 'mongodb';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';
import {
	AdminPeerManagementForbiddenError,
	OwnerManagementRequiresTransferError,
	UserSelfAdministrationForbiddenError,
} from '@/core/accounts/errors/user.errors';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { AdministrativeEventsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/AdministrativeEvents.repository';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { IdentitiesRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Identities.repository';
import { TokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Tokens.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { TokenTypes } from '@/core/accounts/constants/token.constants';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { env } from '@/env';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';
import { ForbiddenError, NotFoundError } from '@/shared/error/error.lib';
import { IEngagementModule } from '@/core/engagement/public';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { CloseUserService } from './CloseUser.service';

let usersRepository: IUsersRepository;
let tokensRepository: ITokensRepository;
let credentialsRepository: ICredentialsRepository;
let identitiesRepository: IIdentitiesRepository;
let administrativeEventsRepository: AdministrativeEventsRepositoryInMemory;
let engagementModule: IEngagementModule;
let storageProvider: MockStorageProvider;
let service: CloseUserService;

const cryptoProvider = new NodeCryptoProvider();
const reason = 'Account closure requested after privacy review';
const userData = createUserFactory({ status: 'suspended' });

let owner: Actor;
let admin: Actor;
let member: Actor;

describe('Close User', () => {
	beforeEach(async () => {
		usersRepository = new UsersRepositoryInMemory();
		const persistedOwner = await usersRepository.create(
			createUserFactory({ email: 'owner-actor@example.com', role: Roles.owner }),
		);
		const persistedAdmin = await usersRepository.create(
			createUserFactory({ email: 'admin-actor@example.com', role: Roles.admin }),
		);
		const persistedMember = await usersRepository.create(
			createUserFactory({ email: 'member-actor@example.com', role: Roles.member }),
		);
		owner = { id: persistedOwner.id, role: persistedOwner.role };
		admin = { id: persistedAdmin.id, role: persistedAdmin.role };
		member = { id: persistedMember.id, role: persistedMember.role };
		tokensRepository = new TokensRepositoryInMemory();
		credentialsRepository = new CredentialsRepositoryInMemory();
		identitiesRepository = new IdentitiesRepositoryInMemory();
		administrativeEventsRepository = new AdministrativeEventsRepositoryInMemory();
		engagementModule = { deleteCommentsByUser: vi.fn().mockResolvedValue(0) };
		storageProvider = new MockStorageProvider();
		service = new CloseUserService(
			usersRepository,
			credentialsRepository,
			identitiesRepository,
			tokensRepository,
			administrativeEventsRepository,
			engagementModule,
			new FakeTransactionManager(),
			storageProvider,
		);
	});

	it('closes a user and records the event', async () => {
		const createdUser = await usersRepository.create(userData);

		await service.execute({ id: createdUser.id, actor: admin, reason });

		expect(await usersRepository.findById(createdUser.id)).toBeNull();
		expect(engagementModule.deleteCommentsByUser).toHaveBeenCalledWith(createdUser.id);
		expect(administrativeEventsRepository.collection).toEqual([
			expect.objectContaining({
				actorId: admin.id,
				targetUserId: createdUser.id,
				action: AdministrativeEventActions.userClosed,
				before: { role: createdUser.role, status: createdUser.status },
				reason,
			}),
		]);
	});

	it('rejects a nonexistent user', async () => {
		await expect(service.execute({ id: new ObjectId().toString(), actor: admin, reason })).rejects.toBeInstanceOf(
			NotFoundError,
		);
	});

	it('rejects a member actor', async () => {
		const createdUser = await usersRepository.create(userData);

		await expect(service.execute({ id: createdUser.id, actor: member, reason })).rejects.toBeInstanceOf(
			ForbiddenError,
		);
		expect(await usersRepository.findById(createdUser.id)).not.toBeNull();
	});

	it('removes authentication data while preserving ratings outside the closure module', async () => {
		const createdUser = await usersRepository.create(userData);
		const userId = createdUser.id;
		await tokensRepository.create({
			userId,
			tokenHash: await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE),
			type: TokenTypes['forgot-password'],
			expiresAt: new Date(Date.now() + 60_000),
		});
		await credentialsRepository.create({ userId, passwordHash: 'hashed-password' });
		await identitiesRepository.create({
			userId,
			provider: IdentityProviders.google,
			providerSubject: 'google-sub-123',
		});

		await service.execute({ id: userId, actor: admin, reason });

		expect(await usersRepository.findById(userId)).toBeNull();
		expect(await tokensRepository.findByUserId(userId)).toHaveLength(0);
		expect(await credentialsRepository.findByUserId(userId)).toBeNull();
		expect(await identitiesRepository.findByUserId(userId)).toHaveLength(0);
		expect(engagementModule.deleteCommentsByUser).toHaveBeenCalledWith(userId);
	});

	it('does not close the owner', async () => {
		await expect(service.execute({ id: owner.id, actor: admin, reason })).rejects.toBeInstanceOf(
			OwnerManagementRequiresTransferError,
		);
		expect(await usersRepository.findById(owner.id)).not.toBeNull();
	});

	it('does not let an admin close their own account', async () => {
		await expect(service.execute({ id: admin.id, actor: admin, reason })).rejects.toBeInstanceOf(
			UserSelfAdministrationForbiddenError,
		);
		expect(await usersRepository.findById(admin.id)).not.toBeNull();
	});

	it('does not let an admin close another admin', async () => {
		const otherAdmin = await usersRepository.create(
			createUserFactory({ email: 'other-admin@example.com', role: Roles.admin }),
		);

		await expect(service.execute({ id: otherAdmin.id, actor: admin, reason })).rejects.toBeInstanceOf(
			AdminPeerManagementForbiddenError,
		);
		expect(await usersRepository.findById(otherAdmin.id)).not.toBeNull();
	});

	it('lets the owner close a suspended admin', async () => {
		await usersRepository.update({ id: admin.id, status: 'suspended' });
		await service.execute({ id: admin.id, actor: owner, reason });

		expect(await usersRepository.findById(admin.id)).toBeNull();
	});
});
