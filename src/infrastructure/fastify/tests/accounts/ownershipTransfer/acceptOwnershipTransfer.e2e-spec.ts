import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { AdministrativeEventActions } from '@/core/accounts/constants/administrativeEvent.constants';
import { AdministrativeEventModel } from '@/core/accounts/infra/mongo/entities/administrativeEvent.model';
import { CredentialModel } from '@/core/accounts/infra/mongo/entities/credential.model';
import { OwnershipTransferInvitationModel } from '@/core/accounts/infra/mongo/entities/ownershipTransferInvitation.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { resolveRateLimitStore } from '@/infrastructure/fastify/rateLimitStore';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';
import {
	OWNERSHIP_TRANSFER_TOKEN,
	createOwnershipTransferInvitation,
} from '@/infrastructure/fastify/tests/accounts/helpers/ownershipTransfer.helpers';

describe('Accept Ownership Transfer', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await resolveRateLimitStore().reset();
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(AdministrativeEventModel);
		await MongoConnection.Instance.emptyCollection(OwnershipTransferInvitationModel);
		await MongoConnection.Instance.emptyCollection(CredentialModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
		await resolveRateLimitStore().reset();
	});

	it('swaps ownership and invalidates both sessions', async () => {
		const { cookies: ownerCookies, user: owner } = await createAndAuthenticateUser(app, {
			email: 'owner@example.com',
			role: Roles.owner,
			emailVerified: true,
		});
		const { cookies: targetCookies, user: target } = await createAndAuthenticateUser(app, {
			email: 'target@example.com',
			role: Roles.admin,
			emailVerified: true,
		});
		const ownerSessionVersion = owner.sessionVersion ?? 1;
		const targetSessionVersion = target.sessionVersion ?? 1;
		await createOwnershipTransferInvitation(owner, target);

		const response = await request(app.server)
			.post('/administration/ownership-transfer/accept')
			.set('Cookie', targetCookies)
			.send({ token: OWNERSHIP_TRANSFER_TOKEN });

		expect(response.status).toBe(HTTP_STATUS.no_content);
		expect(await UserModel.findById(owner.id).lean()).toMatchObject({
			role: Roles.admin,
			session_version: ownerSessionVersion + 1,
		});
		expect(await UserModel.findById(target.id).lean()).toMatchObject({
			role: Roles.owner,
			session_version: targetSessionVersion + 1,
		});
		expect(await OwnershipTransferInvitationModel.findOne().lean()).toBeNull();
		expect((await AdministrativeEventModel.find().lean()).map((event) => event.action)).toEqual(
			expect.arrayContaining([
				AdministrativeEventActions.ownershipTransferred,
				AdministrativeEventActions.userRoleChanged,
			]),
		);

		expect((await request(app.server).get('/me').set('Cookie', ownerCookies)).status).toBe(
			HTTP_STATUS.unauthorized,
		);
		expect((await request(app.server).get('/me').set('Cookie', targetCookies)).status).toBe(
			HTTP_STATUS.unauthorized,
		);
	});
});
