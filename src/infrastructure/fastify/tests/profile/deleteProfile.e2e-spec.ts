import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { TokenModel } from '@/core/accounts/infra/mongo/entities/token.model';
import { Roles } from '@/shared/accessControl/roles';

type ErrorResponseBody = { localeKey: string };

describe('Delete Profile', () => {
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

	it('Should be able to delete the profile', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });

		const response = await request(app.server).delete('/me').set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});

	it('Does not let the owner delete their own profile', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.owner });

		const response = await request(app.server).delete('/me').set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.forbidden);
		expect((response.body as ErrorResponseBody).localeKey).toBe(
			'apiResponses.users.ownerManagementRequiresTransfer',
		);
		expect(await UserModel.findById(user.id).lean().exec()).not.toBeNull();
	});
});
