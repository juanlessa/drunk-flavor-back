import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { TokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Tokens.repository';
import { DeleteProfileService } from './DeleteProfile.service';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { TokenTypes } from '@/core/accounts/entities/token.entity';
import { env } from '@/env';

let cryptoProvider: NodeCryptoProvider;
let usersRepository: IUsersRepository;
let tokensRepository: ITokensRepository;
let service: DeleteProfileService;

const userData = createUserFactory();

describe('Delete Profile', () => {
	beforeEach(() => {
		cryptoProvider = new NodeCryptoProvider();
		usersRepository = new UsersRepositoryInMemory();
		tokensRepository = new TokensRepositoryInMemory();
		service = new DeleteProfileService(usersRepository, tokensRepository);
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

	it('should be able to delete all existing profile tokens', async () => {
		const createdUser = await usersRepository.create(userData);
		await tokensRepository.create({
			user_id: createdUser._id.toString(),
			token: await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE),
			type: TokenTypes['forgot-password'],
			expires_at: new Date(Date.now() + 60_000),
		});
		await tokensRepository.create({
			user_id: createdUser._id.toString(),
			token: await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE),
			type: TokenTypes['email-verification'],
			expires_at: new Date(Date.now() + 60_000),
		});

		await service.execute({ id: createdUser._id.toString() });

		const findDeledUser = await usersRepository.findById(createdUser._id.toString());
		const findDeledTokens = await tokensRepository.findByUserId(createdUser._id.toString());

		expect(findDeledUser).toBeNull();
		expect(findDeledTokens).toHaveLength(0);
	});
});
