import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
	AdministrativeEventActions,
	AdministrativeEventOrigins,
} from '@/core/accounts/entities/administrativeEvent.entity';
import { Roles } from '@/shared/accessControl/roles';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import {
	ADMINISTRATIVE_EVENT_OCCURRED_AT_TTL_INDEX,
	ADMINISTRATIVE_EVENT_RETENTION_SECONDS,
	AdministrativeEventModel,
} from '../entities/administrativeEvent.model';
import { AdministrativeEventsRepository } from './AdministrativeEvents.repository';

type IndexInfo = {
	name: string;
	key: Record<string, number>;
	expireAfterSeconds?: number;
};

let repository: AdministrativeEventsRepository;

beforeAll(async () => {
	await AdministrativeEventModel.init();
});

beforeEach(() => {
	repository = new AdministrativeEventsRepository();
});

afterEach(async () => {
	await AdministrativeEventModel.deleteMany({});
});

describe('AdministrativeEventsRepository (integration)', () => {
	it('persists snake_case data and returns a camelCase domain event', async () => {
		const occurredAt = new Date('2025-01-01T00:00:00.000Z');

		const event = await repository.create({
			actorId: 'actor-id',
			targetUserId: 'target-id',
			action: AdministrativeEventActions.userSuspended,
			before: { role: Roles.member, status: UserStatuses.active },
			after: { role: Roles.member, status: UserStatuses.suspended },
			origin: AdministrativeEventOrigins.api,
			requestId: 'request-id',
			reason: 'Repeated violation of community guidelines',
			occurredAt,
		});

		expect(event.id).toEqual(expect.any(String));
		expect(event).toMatchObject({
			actorId: 'actor-id',
			targetUserId: 'target-id',
			action: AdministrativeEventActions.userSuspended,
			origin: AdministrativeEventOrigins.api,
			requestId: 'request-id',
			occurredAt,
		});
		expect(event).not.toHaveProperty('actor_id');

		const persisted = await AdministrativeEventModel.findById(event.id).lean();
		expect(persisted).toMatchObject({
			actor_id: 'actor-id',
			target_user_id: 'target-id',
			request_id: 'request-id',
			occurred_at: occurredAt,
		});
		expect(persisted).not.toHaveProperty('actorId');
	});

	it('defaults occurredAt and keeps optional state and context absent', async () => {
		const event = await repository.create({
			actorId: 'actor-id',
			targetUserId: 'target-id',
			action: AdministrativeEventActions.userDeleted,
			origin: AdministrativeEventOrigins.system,
		});

		expect(event.occurredAt).toBeInstanceOf(Date);
		expect(event).not.toHaveProperty('before');
		expect(event).not.toHaveProperty('after');
		expect(event).not.toHaveProperty('requestId');
	});

	it('declares the 730-day retention TTL index', async () => {
		const indexes = (await AdministrativeEventModel.collection.indexes()) as unknown as IndexInfo[];
		const ttl = indexes.find((index) => index.name === ADMINISTRATIVE_EVENT_OCCURRED_AT_TTL_INDEX);

		expect(AdministrativeEventModel.collection.collectionName).toBe('administrative_events');
		expect(ttl).toMatchObject({
			key: { occurred_at: 1 },
			expireAfterSeconds: ADMINISTRATIVE_EVENT_RETENTION_SECONDS,
		});
	});

	it('rejects invalid action and origin values', async () => {
		await expect(
			AdministrativeEventModel.create({
				actor_id: 'actor-id',
				target_user_id: 'target-id',
				action: 'user.unknown' as never,
				origin: AdministrativeEventOrigins.api,
			}),
		).rejects.toThrow();
		await expect(
			AdministrativeEventModel.create({
				actor_id: 'actor-id',
				target_user_id: 'target-id',
				action: AdministrativeEventActions.userCreated,
				origin: 'external' as never,
			}),
		).rejects.toThrow();
	});
});
