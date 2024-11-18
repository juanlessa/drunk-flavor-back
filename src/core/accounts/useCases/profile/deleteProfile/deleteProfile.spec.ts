import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { IUserTokensRepository } from '@/core/accounts/repositories/IUserTokens.repository';
import { UserTokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/UserTokens.repository';
import { DeleteProfileService } from './DeleteProfile.service';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { TokenTypeEnum } from '@/core/accounts/entities/userToken.entity';
import { env } from '@/env';

let cryptoProvider: NodeCryptoProvider;
let usersRepository: IUsersRepository;
let userTokensRepository: IUserTokensRepository;
let service: DeleteProfileService;

const userData = createUserFactory();

describe('Delete Profile', () => {
	beforeEach(() => {
		cryptoProvider = new NodeCryptoProvider();
		usersRepository = new UsersRepositoryInMemory();
		userTokensRepository = new UserTokensRepositoryInMemory();
		service = new DeleteProfileService(usersRepository, userTokensRepository);
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
		await userTokensRepository.create({
			user_id: createdUser._id.toString(),
			token: await cryptoProvider.generateToken(env.USER_TOKEN_SIZE),
			type: TokenTypeEnum['forgot-password'],
		});
		await userTokensRepository.create({
			user_id: createdUser._id.toString(),
			token: await cryptoProvider.generateToken(env.USER_TOKEN_SIZE),
			type: TokenTypeEnum['email-verification'],
		});

		await service.execute({ id: createdUser._id.toString() });

		const findDeledUser = await usersRepository.findById(createdUser._id.toString());
		const findDeledTokens = await userTokensRepository.findByUserId(createdUser._id.toString());

		expect(findDeledUser).toBeNull();
		expect(findDeledTokens).toHaveLength(0);
	});
});
