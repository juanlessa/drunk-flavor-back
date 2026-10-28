import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';

type CapabilitiesResponseBody = { actions: string[]; roleTransitions: string[] };

describe('Get User', () => {
	beforeAll(async () => app.ready());
	afterAll(async () => app.close());
	beforeEach(async () => MongoConnection.Instance.emptyCollection(UserModel));

	it('gets a user and resolves active administrative capabilities on demand', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { id } = await createUser(app, { email: 'partner@example.com', role: Roles.partner });

		const user = await request(app.server).get(`/users/${id}`).set('Cookie', cookies).send();
		const capabilities = await request(app.server)
			.get(`/users/${id}/administrative-capabilities`)
			.set('Cookie', cookies)
			.send();

		expect(user.status).toBe(HTTP_STATUS.ok);
		expect(capabilities.status).toBe(HTTP_STATUS.ok);
		expect(capabilities.body as CapabilitiesResponseBody).toEqual({
			actions: ['changeRole', 'suspend'],
			roleTransitions: ['member'],
		});
	});
});
