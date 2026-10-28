import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { TokenModel } from '@/core/accounts/infra/mongo/entities/token.model';
import { Roles } from '@/shared/accessControl/roles';
import { AdministrativeEventModel } from '@/core/accounts/infra/mongo/entities/administrativeEvent.model';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';

describe('Delete User', () => {
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

	it('Should be able to admin delete a user', async () => {
		const { cookies, user: actor } = await createAndAuthenticateUser(app, { role: Roles.admin });

		const userToDelete = await createUser(app, { email: 'partner@example.com', role: Roles.partner });

		const response = await request(app.server)
			.delete('/users')
			.set('Cookie', cookies)
			.send({ id: userToDelete.id });

		expect(response.status).toBe(HTTP_STATUS.no_content);

		const event = await AdministrativeEventModel.findOne({ action: AdministrativeEventActions.userDeleted }).lean();
		expect(event).toMatchObject({
			actor_id: actor.id,
			target_user_id: userToDelete.id,
			action: AdministrativeEventActions.userDeleted,
			before: { role: Roles.partner, status: 'active' },
			origin: 'api',
		});
		expect(event?.after).toBeUndefined();
	});

	it('Should not be able to delete a user when unauthenticated', async () => {
		const userToDelete = await createUser(app, { email: 'partner@example.com', role: Roles.partner });

		const response = await request(app.server).delete('/users').send({ id: userToDelete.id });

		expect(response.status).toBe(HTTP_STATUS.unauthorized);
	});
});
