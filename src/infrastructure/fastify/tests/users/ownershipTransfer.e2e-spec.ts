import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { OWNERSHIP_TRANSFER_INVITATION_SCOPE } from '@/core/accounts/constants/ownershipTransfer.constants';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';
import { AdministrativeEventModel } from '@/core/accounts/infra/mongo/entities/administrativeEvent.model';
import { CredentialModel } from '@/core/accounts/infra/mongo/entities/credential.model';
import { OwnershipTransferInvitationModel } from '@/core/accounts/infra/mongo/entities/ownershipTransferInvitation.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { resolveOwnershipTransferInvitationsRepository } from '@/core/accounts/infra/mongo/container';
import { app } from '@/infrastructure/fastify/app';
import { resolveRateLimitStore } from '@/infrastructure/fastify/rateLimitStore';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCryptoProvider } from '@/shared/providers/cryptography';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';

const reason = 'The current owner is transitioning operational responsibility';

describe('Ownership transfer', () => {
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

	it('requests, resends, and cancels the singleton invitation through HTTP', async () => {
		const { cookies: ownerCookies } = await createAndAuthenticateUser(app, {
			email: 'owner@example.com',
			role: Roles.owner,
			emailVerified: true,
		});
		const { user: target } = await createAndAuthenticateUser(app, {
			email: 'target@example.com',
			role: Roles.admin,
			emailVerified: true,
		});

		const requested = await request(app.server)
			.post('/administration/ownership-transfer')
			.set('Cookie', ownerCookies)
			.send({ targetUserId: target.id, reason });
		expect(requested.status).toBe(HTTP_STATUS.no_content);

		const invitation = await OwnershipTransferInvitationModel.findOne().lean();
		expect(typeof invitation?.current_owner_id).toBe('string');
		expect(invitation).toMatchObject({
			target_user_id: target.id,
			reason,
		});
		const originalTokenHash = invitation?.token_hash;

		const resent = await request(app.server)
			.post('/administration/ownership-transfer/resend')
			.set('Cookie', ownerCookies)
			.send();
		expect(resent.status).toBe(HTTP_STATUS.no_content);
		expect((await OwnershipTransferInvitationModel.findOne().lean())?.token_hash).not.toBe(originalTokenHash);

		const cancelled = await request(app.server)
			.delete('/administration/ownership-transfer')
			.set('Cookie', ownerCookies)
			.send();
		expect(cancelled.status).toBe(HTTP_STATUS.no_content);
		expect(await OwnershipTransferInvitationModel.findOne().lean()).toBeNull();
		expect(
			(await AdministrativeEventModel.find().sort({ occurred_at: 1 }).lean()).map((event) => event.action),
		).toEqual([
			AdministrativeEventActions.ownershipTransferRequested,
			AdministrativeEventActions.ownershipTransferResent,
			AdministrativeEventActions.ownershipTransferCancelled,
		]);
	});

	it('accepts an invitation through HTTP, swaps ownership, and invalidates both sessions', async () => {
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
		const token = 'ownership-acceptance-token';
		await resolveOwnershipTransferInvitationsRepository().create({
			scope: OWNERSHIP_TRANSFER_INVITATION_SCOPE,
			currentOwnerId: owner.id,
			targetUserId: target.id,
			tokenHash: resolveCryptoProvider().hashToken(token),
			reason,
			ownerSessionVersion,
			targetSessionVersion,
			expiresAt: new Date(Date.now() + 60 * 60 * 1000),
		});

		const accepted = await request(app.server)
			.post('/administration/ownership-transfer/accept')
			.set('Cookie', targetCookies)
			.send({ token });

		expect(accepted.status).toBe(HTTP_STATUS.no_content);
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
