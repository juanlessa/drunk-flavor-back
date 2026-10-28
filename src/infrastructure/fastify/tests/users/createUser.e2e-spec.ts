import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';
import { AdministrativeEventModel } from '@/core/accounts/infra/mongo/entities/administrativeEvent.model';
import { TokenModel } from '@/core/accounts/infra/mongo/entities/token.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';

describe('Create User', () => {
	beforeAll(async () => app.ready());
	afterAll(async () => app.close());
	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(TokenModel);
		await MongoConnection.Instance.emptyCollection(AdministrativeEventModel);
	});

	it('Should be able to admin create a user', async () => {
		const { cookies, user: actor } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { name, surname, email, role } = createUserFactory({
			email: 'partner@example.com',
			role: Roles.partner,
		});

		const response = await request(app.server)
			.post('/users')
			.set('Cookie', cookies)
			.send({ name, surname, email, password: 'Password-12345678', role });

		expect(response.status).toBe(HTTP_STATUS.created);
		expect(
			await AdministrativeEventModel.findOne({ action: AdministrativeEventActions.userCreated }).lean(),
		).toMatchObject({
			actor_id: actor.id,
			action: AdministrativeEventActions.userCreated,
			after: { role: Roles.partner, status: 'pending' },
			origin: 'api',
		});
	});
});
