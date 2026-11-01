import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { RECENT_AUTHENTICATION_WINDOW_MS } from '@/core/accounts/constants/reauthentication.constants';
import { AdministrativeEventActions } from '@/core/accounts/constants/administrativeEvent.constants';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { AdministrativeEventModel } from '@/core/accounts/infra/mongo/entities/administrativeEvent.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { AUTH_COOKIE } from '@/infrastructure/fastify/constants/cookie.constants';
import { AUTH_SESSION, AUTH_SESSION_COOKIE } from '@/infrastructure/fastify/constants/session.constants';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';

type ErrorResponseBody = { localeKey: string };
const reason = 'Security review requires ending all existing sessions';

const expectTargetUnchanged = async (targetId: string, sessionVersion: number) => {
	expect(await UserModel.findById(targetId).lean()).toMatchObject({ session_version: sessionVersion });
	expect(await AdministrativeEventModel.countDocuments({})).toBe(0);
};

const createStaleAuthenticationCookies = (
	cookies: string[],
	timestampField: 'authenticatedAt' | 'reauthenticatedAt',
): string[] => {
	const sessionCookie = cookies.find((cookie) => cookie.startsWith(`${AUTH_SESSION_COOKIE}=`));
	if (!sessionCookie) {
		throw new Error('Expected an authentication session cookie');
	}
	const cookieValue = sessionCookie.slice(AUTH_SESSION_COOKIE.length + 1).split(';')[0];
	const session = app.decodeSecureSession(decodeURIComponent(cookieValue));
	if (!session) {
		throw new Error('Expected a decodable authentication session');
	}
	const authenticationSession = session.get(AUTH_SESSION);
	if (!authenticationSession) {
		throw new Error('Expected authentication session data');
	}
	const staleTimestamp = new Date(Date.now() - RECENT_AUTHENTICATION_WINDOW_MS - 1).toISOString();
	session.set(AUTH_SESSION, {
		...authenticationSession,
		[timestampField]: staleTimestamp,
	});
	const encodedCookie = encodeURIComponent(app.encodeSecureSession(session));

	return cookies.map((cookie) =>
		cookie.startsWith(`${AUTH_SESSION_COOKIE}=`) ? `${AUTH_SESSION_COOKIE}=${encodedCookie}` : cookie,
	);
};

describe('Revoke User Sessions', () => {
	beforeAll(async () => app.ready());
	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(AdministrativeEventModel);
	});
	afterAll(async () => app.close());

	it.each([
		['invalid id', 'invalid-id', { reason }, 'apiResponses.users.invalidIdFormat'],
		['missing reason', null, {}, 'apiResponses.users.requiredAdministrationReason'],
		['non-string reason', null, { reason: 42 }, 'apiResponses.users.requiredAdministrationReason'],
		['trimmed short reason', null, { reason: '   short   ' }, 'apiResponses.users.invalidAdministrationReasonMin'],
		['overlong reason', null, { reason: 'a'.repeat(501) }, 'apiResponses.users.invalidAdministrationReasonMax'],
	] as const)('rejects %s without changing state', async (_case, requestedId, body, localeKey) => {
		const { cookies } = await createAndAuthenticateUser(app, {
			email: 'owner@example.com',
			role: Roles.owner,
		});
		const target = await createUser(app, { email: 'target@example.com', sessionVersion: 3 });

		const response = await request(app.server)
			.post(`/users/${requestedId ?? target.id}/session-revocation`)
			.set('Cookie', cookies)
			.send(body);

		expect(response.status).toBe(HTTP_STATUS.bad_request);
		expect((response.body as ErrorResponseBody).localeKey).toBe(localeKey);
		await expectTargetUnchanged(target.id, 3);
	});

	it('requires recent authentication without changing state', async () => {
		const { cookies } = await createAndAuthenticateUser(app, {
			email: 'owner@example.com',
			role: Roles.owner,
		});
		const target = await createUser(app, { email: 'target@example.com', sessionVersion: 2 });
		const accessCookie = (cookies as unknown as string[]).find((cookie) => cookie.startsWith(`${AUTH_COOKIE}=`));

		const response = await request(app.server)
			.post(`/users/${target.id}/session-revocation`)
			.set('Cookie', accessCookie as string)
			.send({ reason });

		expect(response.status).toBe(HTTP_STATUS.unauthorized);
		expect((response.body as ErrorResponseBody).localeKey).toBe(
			'apiResponses.profile.recentAuthenticationRequired',
		);
		await expectTargetUnchanged(target.id, 2);
	});

	it.each(['authenticatedAt', 'reauthenticatedAt'] as const)(
		'rejects a stale %s proof without changing state',
		async (timestampField) => {
			const { cookies } = await createAndAuthenticateUser(app, {
				email: 'owner@example.com',
				role: Roles.owner,
			});
			const target = await createUser(app, { email: 'target@example.com', sessionVersion: 2 });
			const staleCookies = createStaleAuthenticationCookies(cookies as unknown as string[], timestampField);

			const response = await request(app.server)
				.post(`/users/${target.id}/session-revocation`)
				.set('Cookie', staleCookies)
				.send({ reason });

			expect(response.status).toBe(HTTP_STATUS.unauthorized);
			expect((response.body as ErrorResponseBody).localeKey).toBe(
				'apiResponses.profile.recentAuthenticationRequired',
			);
			await expectTargetUnchanged(target.id, 2);
		},
	);

	it('applies broad permission denial before target policy for a member actor', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { email: 'actor@example.com', role: Roles.member });
		const target = await createUser(app, { email: 'target@example.com', sessionVersion: 2 });

		const response = await request(app.server)
			.post(`/users/${target.id}/session-revocation`)
			.set('Cookie', cookies)
			.send({ reason });

		expect(response.status).toBe(HTTP_STATUS.forbidden);
		expect((response.body as ErrorResponseBody).localeKey).toBe('apiResponses.auth.invalidCredentials');
		await expectTargetUnchanged(target.id, 2);
	});

	it.each([
		['owner self-target', Roles.owner, Roles.owner, 'apiResponses.users.selfAdministrationForbidden'],
		['admin owner-target', Roles.admin, Roles.owner, 'apiResponses.users.ownerManagementRequiresTransfer'],
		['admin peer-target', Roles.admin, Roles.admin, 'apiResponses.users.adminPeerManagementForbidden'],
	] as const)(
		'enforces the %s policy denial without changing state',
		async (_case, actorRole, targetRole, localeKey) => {
			const { cookies, user: actor } = await createAndAuthenticateUser(app, {
				email: 'actor@example.com',
				role: actorRole,
			});
			const target =
				actorRole === Roles.owner && targetRole === Roles.owner
					? actor
					: await createUser(app, { email: 'target@example.com', role: targetRole, sessionVersion: 2 });

			const response = await request(app.server)
				.post(`/users/${target.id}/session-revocation`)
				.set('Cookie', cookies)
				.send({ reason });

			expect(response.status).toBe(HTTP_STATUS.forbidden);
			expect((response.body as ErrorResponseBody).localeKey).toBe(localeKey);
			await expectTargetUnchanged(target.id, target.sessionVersion);
		},
	);

	it('rejects an ineligible target status and a missing target without effects', async () => {
		const { cookies } = await createAndAuthenticateUser(app, {
			email: 'owner@example.com',
			role: Roles.owner,
		});
		const target = await createUser(app, {
			email: 'target@example.com',
			status: UserStatuses.incomplete_profile,
			sessionVersion: 2,
		});

		const ineligible = await request(app.server)
			.post(`/users/${target.id}/session-revocation`)
			.set('Cookie', cookies)
			.send({ reason });
		expect(ineligible.status).toBe(HTTP_STATUS.conflict);
		expect((ineligible.body as ErrorResponseBody).localeKey).toBe('apiResponses.users.invalidStatusTransition');
		await expectTargetUnchanged(target.id, 2);

		const missingId = '507f1f77bcf86cd799439011';
		const missing = await request(app.server)
			.post(`/users/${missingId}/session-revocation`)
			.set('Cookie', cookies)
			.send({ reason });
		expect(missing.status).toBe(HTTP_STATUS.not_found);
		expect((missing.body as ErrorResponseBody).localeKey).toBe('apiResponses.users.notExist');
		await expectTargetUnchanged(target.id, 2);
	});

	it('rejects an actor deleted after token issuance and clears both cookies', async () => {
		const { cookies, user: actor } = await createAndAuthenticateUser(app, {
			email: 'owner@example.com',
			role: Roles.owner,
		});
		const target = await createUser(app, { email: 'target@example.com', sessionVersion: 2 });
		await UserModel.findByIdAndDelete(actor.id);

		const response = await request(app.server)
			.post(`/users/${target.id}/session-revocation`)
			.set('Cookie', cookies)
			.send({ reason });

		expect(response.status).toBe(HTTP_STATUS.unauthorized);
		expect((response.body as ErrorResponseBody).localeKey).toBe('apiResponses.auth.sessionRevoked');
		const clearedCookies = response.headers['set-cookie'] as unknown as string[];
		expect(clearedCookies).toEqual(
			expect.arrayContaining([
				expect.stringContaining(`${AUTH_COOKIE}=;`),
				expect.stringContaining(`${AUTH_SESSION_COOKIE}=;`),
			]),
		);
		await expectTargetUnchanged(target.id, 2);
	});

	it('revokes an active member session on its next authenticated request', async () => {
		const { cookies: ownerCookies, user: owner } = await createAndAuthenticateUser(app, {
			email: 'owner@example.com',
			role: Roles.owner,
		});
		const { cookies: memberCookies, user: member } = await createAndAuthenticateUser(app, {
			email: 'member@example.com',
			role: Roles.member,
			sessionVersion: 4,
		});

		const before = await request(app.server).get('/me').set('Cookie', memberCookies).send();
		expect(before.status).toBe(HTTP_STATUS.ok);

		const response = await request(app.server)
			.post(`/users/${member.id}/session-revocation`)
			.set('Cookie', ownerCookies)
			.send({ reason });
		expect(response.status).toBe(HTTP_STATUS.no_content);
		expect(response.text).toBe('');

		expect(await UserModel.findById(member.id).lean()).toMatchObject({
			role: Roles.member,
			status: UserStatuses.active,
			session_version: 5,
		});
		const events = await AdministrativeEventModel.find({
			action: AdministrativeEventActions.userSessionsRevoked,
		}).lean();
		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			actor_id: owner.id,
			target_user_id: member.id,
			action: AdministrativeEventActions.userSessionsRevoked,
			before: { role: Roles.member, status: UserStatuses.active },
			after: { role: Roles.member, status: UserStatuses.active },
			origin: 'api',
			reason,
		});
		expect(typeof events[0]?.request_id).toBe('string');

		const revoked = await request(app.server).get('/me').set('Cookie', memberCookies).send();
		expect(revoked.status).toBe(HTTP_STATUS.unauthorized);
		expect((revoked.body as ErrorResponseBody).localeKey).toBe('apiResponses.auth.sessionRevoked');
		const clearedCookies = revoked.headers['set-cookie'] as unknown as string[];
		expect(clearedCookies).toEqual(
			expect.arrayContaining([
				expect.stringContaining(`${AUTH_COOKIE}=;`),
				expect.stringContaining(`${AUTH_SESSION_COOKIE}=;`),
			]),
		);
	});
});
