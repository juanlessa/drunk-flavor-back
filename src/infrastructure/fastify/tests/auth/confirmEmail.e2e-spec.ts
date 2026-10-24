import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createUser } from '../helpers/authentication.helpers';
import { TokenModel } from '@/core/accounts/infra/mongo/entities/token.model';
import { resolveTokensRepository } from '@/core/accounts/infra/mongo/container';
import { resolveCryptoProvider } from '@/shared/providers/cryptography';
import { resolveDateProvider } from '@/shared/providers/date';
import { env } from '@/env';
import { TokenTypes } from '@/core/accounts/entities/token.entity';
import { Roles } from '@/shared/accessControl/roles';

describe('Confirm Email', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(TokenModel);
	});

	it('Should be able to confirm the email', async () => {
		const { id } = await createUser(app, { role: Roles.member });

		const cryptoProvider = resolveCryptoProvider();
		const tokensRepository = resolveTokensRepository();
		const dateProvider = resolveDateProvider();

		const token = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);

		await tokensRepository.create({
			token: cryptoProvider.hashToken(token),
			type: TokenTypes['email-verification'],
			user_id: id,
			expires_at: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		const response = await request(app.server).post('/email-verification/confirm').send({ token });

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
