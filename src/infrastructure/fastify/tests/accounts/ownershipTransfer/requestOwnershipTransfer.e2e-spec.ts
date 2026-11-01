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
import { OWNERSHIP_TRANSFER_REASON } from '@/infrastructure/fastify/tests/accounts/helpers/ownershipTransfer.helpers';

describe('Request Ownership Transfer', () => {
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

	it('creates the singleton invitation for an eligible admin', async () => {
		const { cookies: ownerCookies, user: owner } = await createAndAuthenticateUser(app, {
			email: 'owner@example.com',
			role: Roles.owner,
			emailVerified: true,
		});
		const { user: target } = await createAndAuthenticateUser(app, {
			email: 'target@example.com',
			role: Roles.admin,
			emailVerified: true,
		});

		const response = await request(app.server)
			.post('/administration/ownership-transfer')
			.set('Cookie', ownerCookies)
			.send({ targetUserId: target.id, reason: OWNERSHIP_TRANSFER_REASON });

		expect(response.status).toBe(HTTP_STATUS.no_content);
		expect(await OwnershipTransferInvitationModel.findOne().lean()).toMatchObject({
			current_owner_id: owner.id,
			target_user_id: target.id,
			reason: OWNERSHIP_TRANSFER_REASON,
		});
		expect((await AdministrativeEventModel.find().lean()).map((event) => event.action)).toEqual([
			AdministrativeEventActions.ownershipTransferRequested,
		]);
	});
});
