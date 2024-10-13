import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createUser } from '../helpers/authentication.helpers';
import { UserRolesEnum } from '@/core/accounts/entities/user.entity';
import { UserTokenModel } from '@/core/accounts/infra/mongo/entities/userToken.model';
import { resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { resolveCryptoProvider } from '@/shared/providers/cryptography';
import { env } from '@/env';
import { TokenTypeEnum } from '@/core/accounts/entities/userToken.entity';

describe('Reset Password', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(UserModel);
		await MongoRepository.Instance.emptyCollection(UserTokenModel);
	});

	it('Should be able to reset the password', async () => {
		const { id } = await createUser(app, { role: UserRolesEnum.member });

		const cryptoProvider = resolveCryptoProvider();
		const userTokensRepository = resolveUserTokensRepository();

		const token = await cryptoProvider.generateToken(env.USER_TOKEN_SIZE);

		await userTokensRepository.create({ token, type: TokenTypeEnum['forgot-password'], user_id: id });

		const newPassword = 'New-password-87654321';

		const response = await request(app.server)
			.post('/reset-password')
			.send({ token, password: newPassword, confirmPassword: newPassword });

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
