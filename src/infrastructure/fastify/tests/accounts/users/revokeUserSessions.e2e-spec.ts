import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { AdministrativeEventActions } from '@/core/accounts/constants/administrativeEvent.constants';
import {
	SESSION_VERSION_MARKER_STORE_READY_KEY,
	SESSION_VERSION_MARKER_TTL_MARGIN_SECONDS,
} from '@/core/accounts/constants/sessionVersionMarker.constants';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { AdministrativeEventModel } from '@/core/accounts/infra/mongo/entities/administrativeEvent.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { toSessionVersionMarkerKey } from '@/core/accounts/infra/redis/stores/SessionVersionMarker.store';
import { env } from '@/env';
import { app } from '@/infrastructure/fastify/app';
import { AUTH_COOKIE } from '@/infrastructure/fastify/constants/cookie.constants';
import { AUTH_SESSION_COOKIE } from '@/infrastructure/fastify/constants/session.constants';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { RedisConnection } from '@/infrastructure/redis/RedisConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import {
	createAndAuthenticateUser,
	createUser,
} from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';

type ErrorResponseBody = { localeKey: string };

const reason = 'Security review requires ending all existing sessions';

const MARKER_TTL_MS = (env.ACCESS_TOKEN_EXPIRES_IN_SECONDS + SESSION_VERSION_MARKER_TTL_MARGIN_SECONDS) * 1000;

/** Production state: the marker store has been tracking writes for longer than one marker TTL. */
const markMarkerStoreReady = () =>
	RedisConnection.Instance.client.set(
		SESSION_VERSION_MARKER_STORE_READY_KEY,
		String(Date.now() - MARKER_TTL_MS - 1000),
	);

describe('Revoke User Sessions', () => {
	beforeAll(async () => app.ready());

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(AdministrativeEventModel);
		await RedisConnection.Instance.flushCache();
	});

	afterAll(async () => {
		await RedisConnection.Instance.flushCache();
		await app.close();
	});

	it('revokes an active member session on its next authenticated request', async () => {
		await markMarkerStoreReady();
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
		expect(await RedisConnection.Instance.client.get(toSessionVersionMarkerKey(member.id))).toBe('5');
		const events = await AdministrativeEventModel.find({
			action: AdministrativeEventActions.userSessionsRevoked,
		}).lean();
		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			actor_id: owner.id,
			target_user_id: member.id,
			origin: 'api',
			reason,
		});

		const revoked = await request(app.server).get('/me').set('Cookie', memberCookies).send();
		expect(revoked.status).toBe(HTTP_STATUS.unauthorized);
		expect((revoked.body as ErrorResponseBody).localeKey).toBe('apiResponses.auth.sessionRevoked');
		expect(revoked.headers['set-cookie'] as unknown as string[]).toEqual(
			expect.arrayContaining([
				expect.stringContaining(`${AUTH_COOKIE}=;`),
				expect.stringContaining(`${AUTH_SESSION_COOKIE}=;`),
			]),
		);
	});

	// Kept as a security wiring check: no unit test proves that this destructive route enforces step-up.
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
		expect(await UserModel.findById(target.id).lean()).toMatchObject({ session_version: 2 });
		expect(await AdministrativeEventModel.countDocuments({})).toBe(0);
	});
});
