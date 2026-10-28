import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	AdministrativeEventActions,
	AdministrativeEventOrigins,
} from '@/core/accounts/entities/administrativeEvent.entity';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { UserAdministrationForbiddenError } from '@/core/accounts/errors/user.errors';
import { AdministrativeEventsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/AdministrativeEvents.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { Roles } from '@/shared/accessControl/roles';
import { NotFoundError } from '@/shared/error/error.lib';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { SuspendUserService } from './SuspendUser.service';

let usersRepository: UsersRepositoryInMemory;
let eventsRepository: AdministrativeEventsRepositoryInMemory;
let service: SuspendUserService;

const reason = 'Repeated violation of community guidelines';

beforeEach(() => {
	usersRepository = new UsersRepositoryInMemory();
	eventsRepository = new AdministrativeEventsRepositoryInMemory();
	service = new SuspendUserService(usersRepository, new FakeTransactionManager(), eventsRepository);
});

describe('SuspendUserService', () => {
	it('suspends an active managed user, revokes sessions, and records the audit event', async () => {
		const actor = await usersRepository.create(
			createUserFactory({ email: 'admin@example.com', role: Roles.admin }),
		);
		const target = await usersRepository.create(createUserFactory({ email: 'target@example.com' }));

		await service.execute({
			id: target.id,
			reason,
			actor: { id: actor.id, role: actor.role },
			administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: 'request-1' },
		});

		expect(await usersRepository.findById(target.id)).toMatchObject({
			status: UserStatuses.suspended,
			sessionVersion: target.sessionVersion + 1,
		});
		expect(eventsRepository.collection).toEqual([
			expect.objectContaining({
				actorId: actor.id,
				targetUserId: target.id,
				action: AdministrativeEventActions.userSuspended,
				before: { status: UserStatuses.active },
				after: { status: UserStatuses.suspended },
				reason,
				requestId: 'request-1',
			}),
		]);
	});

	it('treats an already suspended user as an idempotent no-op', async () => {
		const actor = await usersRepository.create(
			createUserFactory({ email: 'admin@example.com', role: Roles.admin }),
		);
		const target = await usersRepository.create(
			createUserFactory({ email: 'target@example.com', status: UserStatuses.suspended, sessionVersion: 3 }),
		);
		const updateSpy = vi.spyOn(usersRepository, 'update');

		await service.execute({ id: target.id, reason, actor: { id: actor.id, role: actor.role } });

		expect(updateSpy).not.toHaveBeenCalled();
		expect(eventsRepository.collection).toHaveLength(0);
	});

	it('reloads the actor instead of trusting privileged token claims', async () => {
		const actor = await usersRepository.create(
			createUserFactory({ email: 'member@example.com', role: Roles.member }),
		);
		const target = await usersRepository.create(createUserFactory({ email: 'target@example.com' }));

		await expect(
			service.execute({ id: target.id, reason, actor: { id: actor.id, role: Roles.owner } }),
		).rejects.toBeInstanceOf(UserAdministrationForbiddenError);
		expect((await usersRepository.findById(target.id))?.status).toBe(UserStatuses.active);
	});

	it('rejects missing actors and targets consistently', async () => {
		const actor = await usersRepository.create(
			createUserFactory({ email: 'admin@example.com', role: Roles.admin }),
		);
		await expect(
			service.execute({ id: 'missing-target', reason, actor: { id: actor.id, role: actor.role } }),
		).rejects.toBeInstanceOf(NotFoundError);
		await expect(
			service.execute({ id: actor.id, reason, actor: { id: 'missing-actor', role: Roles.owner } }),
		).rejects.toBeInstanceOf(NotFoundError);
	});
});
