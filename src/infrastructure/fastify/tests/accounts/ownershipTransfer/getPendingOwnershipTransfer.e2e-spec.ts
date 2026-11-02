import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
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
	OWNERSHIP_TRANSFER_REASON,
	createOwnershipTransferInvitation,
} from '@/infrastructure/fastify/tests/accounts/helpers/ownershipTransfer.helpers';

describe('Get Pending Ownership Transfer', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await resolveRateLimitStore().reset();
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(OwnershipTransferInvitationModel);
		await MongoConnection.Instance.emptyCollection(CredentialModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
		await resolveRateLimitStore().reset();
	});

	it('returns the pending invitation to the owner', async () => {
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
		await createOwnershipTransferInvitation(owner, target);

		const response = await request(app.server)
			.get('/administration/ownership-transfer')
			.set('Cookie', ownerCookies);

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(response.body).toMatchObject({ targetUserId: target.id, reason: OWNERSHIP_TRANSFER_REASON });
	});
});
