import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { DeleteUserService } from './DeleteUser.service';
import { NotFoundError, ForbiddenError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { TokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Tokens.repository';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { IdentitiesRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Identities.repository';
import { AdministrativeEventsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/AdministrativeEvents.repository';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { TokenTypes } from '@/core/accounts/constants/token.constants';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { env } from '@/env';
import {
	AdminPeerManagementForbiddenError,
	OwnerManagementRequiresTransferError,
	UserSelfAdministrationForbiddenError,
} from '@/core/accounts/errors/user.errors';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';

let cryptoProvider: NodeCryptoProvider;
let usersRepository: IUsersRepository;
let tokensRepository: ITokensRepository;
let credentialsRepository: ICredentialsRepository;
let identitiesRepository: IIdentitiesRepository;
let administrativeEventsRepository: AdministrativeEventsRepositoryInMemory;
let service: DeleteUserService;

const userData = createUserFactory();

let owner: Actor;
let admin: Actor;
let member: Actor;

describe('Delete User', () => {
	beforeEach(async () => {
		cryptoProvider = new NodeCryptoProvider();
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
		service = new DeleteUserService(
			usersRepository,
			tokensRepository,
			credentialsRepository,
			identitiesRepository,
			new FakeTransactionManager(),
			administrativeEventsRepository,
		);
	});

	it('should be able to delete a user', async () => {
		const createdUser = await usersRepository.create(userData);

		await service.execute({ id: createdUser.id, actor: admin });

		const findDeledUser = await usersRepository.findById(createdUser.id);

		expect(findDeledUser).toBeNull();
		expect(administrativeEventsRepository.collection).toEqual([
			expect.objectContaining({
				actorId: admin.id,
				targetUserId: createdUser.id,
				action: AdministrativeEventActions.userDeleted,
				before: { role: createdUser.role, status: createdUser.status },
			}),
		]);
	});

	it('should not be able to delete a nonexistent user', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId, actor: admin })).rejects.toBeInstanceOf(NotFoundError);
	});

	it('should not be able to delete a user when the actor is a member', async () => {
		const createdUser = await usersRepository.create(userData);

		await expect(service.execute({ id: createdUser.id, actor: member })).rejects.toBeInstanceOf(ForbiddenError);

		const findUser = await usersRepository.findById(createdUser.id);
		expect(findUser).not.toBeNull();
	});

	it('should delete the user together with its tokens, credential and identities', async () => {
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

		await service.execute({ id: userId, actor: admin });

		expect(await usersRepository.findById(userId)).toBeNull();
		expect(await tokensRepository.findByUserId(userId)).toHaveLength(0);
		expect(await credentialsRepository.findByUserId(userId)).toBeNull();
		expect(await identitiesRepository.findByUserId(userId)).toHaveLength(0);
	});

	it('does not delete the owner through user administration', async () => {
		await expect(service.execute({ id: owner.id, actor: admin })).rejects.toBeInstanceOf(
			OwnerManagementRequiresTransferError,
		);

		expect(await usersRepository.findById(owner.id)).not.toBeNull();
	});

	it('does not let an admin delete their own account through user administration', async () => {
		await expect(service.execute({ id: admin.id, actor: admin })).rejects.toBeInstanceOf(
			UserSelfAdministrationForbiddenError,
		);

		expect(await usersRepository.findById(admin.id)).not.toBeNull();
	});

	it('does not let an admin delete another admin', async () => {
		const otherAdmin = await usersRepository.create(
			createUserFactory({ email: 'other-admin@example.com', role: Roles.admin }),
		);

		await expect(service.execute({ id: otherAdmin.id, actor: admin })).rejects.toBeInstanceOf(
			AdminPeerManagementForbiddenError,
		);
		expect(await usersRepository.findById(otherAdmin.id)).not.toBeNull();
	});

	it('lets the owner delete an admin', async () => {
		await service.execute({ id: admin.id, actor: owner });

		expect(await usersRepository.findById(admin.id)).toBeNull();
	});
});
