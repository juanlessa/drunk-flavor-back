import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { TokenModel } from '@/core/accounts/infra/mongo/entities/token.model';
import { Roles } from '@/shared/accessControl/roles';
import {
	ADMINISTRATIVE_EVENT_OCCURRED_AT_TTL_INDEX,
	ADMINISTRATIVE_EVENT_RETENTION_SECONDS,
	AdministrativeEventModel,
} from '@/core/accounts/infra/mongo/entities/administrativeEvent.model';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';

describe('Create User', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

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
		const password = 'Password-12345678';

		const response = await request(app.server)
			.post('/users')
			.set('Cookie', cookies)
			.send({ name, surname, email, password, role });

		expect(response.status).toBe(HTTP_STATUS.created);

		const event = await AdministrativeEventModel.findOne({ action: AdministrativeEventActions.userCreated }).lean();
		expect(event).toMatchObject({
			actor_id: actor.id,
			action: AdministrativeEventActions.userCreated,
			after: { role: Roles.partner, status: 'pending' },
			origin: 'api',
		});
		expect(event?.target_user_id).toBeTruthy();
		expect(event?.request_id).toBeTruthy();
		expect(event).not.toHaveProperty('email');
		expect(event).not.toHaveProperty('name');

		const indexes = await AdministrativeEventModel.collection.indexes();
		const ttlIndex = indexes.find((index) => index.name === ADMINISTRATIVE_EVENT_OCCURRED_AT_TTL_INDEX);
		expect(ttlIndex?.key).toEqual({ occurred_at: 1 });
		expect(ttlIndex?.expireAfterSeconds).toBe(ADMINISTRATIVE_EVENT_RETENTION_SECONDS);
	});

	it('Should not be able to create a user when unauthenticated', async () => {
		const { name, surname, email, role } = createUserFactory({
			email: 'partner@example.com',
			role: Roles.partner,
		});
		const password = 'Password-12345678';

		const response = await request(app.server).post('/users').send({ name, surname, email, password, role });

		expect(response.status).toBe(HTTP_STATUS.unauthorized);
	});
});
