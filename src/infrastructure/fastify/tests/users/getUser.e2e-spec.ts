import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { Roles } from '@/shared/accessControl/roles';

type CapabilitiesResponseBody = {
	actions: string[];
	roleTransitions: string[];
};

describe('Get User', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('gets a user and resolves administrative capabilities on demand', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { id } = await createUser(app, { email: 'partner@example.com', role: Roles.partner });

		const response = await request(app.server).get(`/users/${id}`).set('Cookie', cookies).send();
		expect(response.status).toBe(HTTP_STATUS.ok);

		const activeCapabilities = await request(app.server)
			.get(`/users/${id}/administrative-capabilities`)
			.set('Cookie', cookies)
			.send();
		expect(activeCapabilities.status).toBe(HTTP_STATUS.ok);
		expect(activeCapabilities.body as CapabilitiesResponseBody).toEqual({
			actions: ['changeRole', 'suspend'],
			roleTransitions: ['member'],
		});

		const suspension = await request(app.server)
			.post(`/users/${id}/suspension`)
			.set('Cookie', cookies)
			.send({ reason: 'Suspend account before permanent closure' });
		expect(suspension.status).toBe(HTTP_STATUS.no_content);

		const suspendedCapabilities = await request(app.server)
			.get(`/users/${id}/administrative-capabilities`)
			.set('Cookie', cookies)
			.send();
		expect(suspendedCapabilities.status).toBe(HTTP_STATUS.ok);
		expect(suspendedCapabilities.body as CapabilitiesResponseBody).toEqual({
			actions: ['changeRole', 'reactivate', 'close'],
			roleTransitions: ['member'],
		});
	});

	it('rejects an unauthenticated capabilities request', async () => {
		const { id } = await createUser(app, { email: 'partner@example.com', role: Roles.partner });

		const response = await request(app.server).get(`/users/${id}/administrative-capabilities`).send();

		expect(response.status).toBe(HTTP_STATUS.unauthorized);
	});
});
