import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { DeleteUserService } from './DeleteUser.service';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { TokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Tokens.repository';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { TokenTypes } from '@/core/accounts/constants/token.constants';
import { env } from '@/env';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';

let cryptoProvider: NodeCryptoProvider;
let usersRepository: IUsersRepository;
let tokensRepository: ITokensRepository;
let service: DeleteUserService;

const userData = createUserFactory();

const admin: Actor = { id: new ObjectId().toString(), role: Roles.admin };
const member: Actor = { id: new ObjectId().toString(), role: Roles.member };

describe('Delete User', () => {
	beforeEach(() => {
		cryptoProvider = new NodeCryptoProvider();
		usersRepository = new UsersRepositoryInMemory();
		tokensRepository = new TokensRepositoryInMemory();
		service = new DeleteUserService(usersRepository, tokensRepository);
	});

	it('should be able to delete a user', async () => {
		const createdUser = await usersRepository.create(userData);

		await service.execute({ id: createdUser._id.toString(), actor: admin });

		const findDeledUser = await usersRepository.findById(createdUser._id.toString());

		expect(findDeledUser).toBeNull();
	});

	it('should not be able to delete a nonexistent user', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId, actor: admin })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to delete a user when the actor is a member', async () => {
		const createdUser = await usersRepository.create(userData);

		await expect(service.execute({ id: createdUser._id.toString(), actor: member })).rejects.toBeInstanceOf(
			ForbiddenError,
		);

		const findUser = await usersRepository.findById(createdUser._id.toString());
		expect(findUser).not.toBeNull();
	});

	it('should be able to delete all existing user tokens', async () => {
		const createdUser = await usersRepository.create(userData);
		await tokensRepository.create({
			user_id: createdUser._id.toString(),
			token_hash: await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE),
			type: TokenTypes['forgot-password'],
			expires_at: new Date(Date.now() + 60_000),
		});
		await tokensRepository.create({
			user_id: createdUser._id.toString(),
			token_hash: await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE),
			type: TokenTypes['email-verification'],
			expires_at: new Date(Date.now() + 60_000),
		});

		await service.execute({ id: createdUser._id.toString(), actor: admin });

		const findDeledUser = await usersRepository.findById(createdUser._id.toString());
		const findDeledTokens = await tokensRepository.findByUserId(createdUser._id.toString());

		expect(findDeledUser).toBeNull();
		expect(findDeledTokens).toHaveLength(0);
	});
});
