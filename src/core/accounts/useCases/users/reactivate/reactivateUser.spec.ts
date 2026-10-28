import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { AdminPeerManagementForbiddenError } from '@/core/accounts/errors/user.errors';
import { AdministrativeEventsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/AdministrativeEvents.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { Roles } from '@/shared/accessControl/roles';
import { NotFoundError } from '@/shared/error/error.lib';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { ReactivateUserService } from './ReactivateUser.service';

let usersRepository: UsersRepositoryInMemory;
let eventsRepository: AdministrativeEventsRepositoryInMemory;
let service: ReactivateUserService;

const reason = 'Administrative review completed successfully';

beforeEach(() => {
	usersRepository = new UsersRepositoryInMemory();
	eventsRepository = new AdministrativeEventsRepositoryInMemory();
	service = new ReactivateUserService(usersRepository, new FakeTransactionManager(), eventsRepository);
});

describe('ReactivateUserService', () => {
	it('reactivates a suspended managed user, revokes sessions, and records the audit event', async () => {
		const actor = await usersRepository.create(
			createUserFactory({ email: 'owner@example.com', role: Roles.owner }),
		);
		const target = await usersRepository.create(
			createUserFactory({ email: 'target@example.com', status: UserStatuses.suspended, sessionVersion: 2 }),
		);

		await service.execute({ id: target.id, reason, actor: { id: actor.id, role: actor.role } });

		expect(await usersRepository.findById(target.id)).toMatchObject({
			status: UserStatuses.active,
			sessionVersion: 3,
		});
		expect(eventsRepository.collection).toEqual([
			expect.objectContaining({
				actorId: actor.id,
				targetUserId: target.id,
				action: AdministrativeEventActions.userReactivated,
				before: { status: UserStatuses.suspended },
				after: { status: UserStatuses.active },
				reason,
			}),
		]);
	});

	it('treats an already active user as an idempotent no-op', async () => {
		const actor = await usersRepository.create(
			createUserFactory({ email: 'admin@example.com', role: Roles.admin }),
		);
		const target = await usersRepository.create(createUserFactory({ email: 'target@example.com' }));
		const updateSpy = vi.spyOn(usersRepository, 'update');

		await service.execute({ id: target.id, reason, actor: { id: actor.id, role: actor.role } });

		expect(updateSpy).not.toHaveBeenCalled();
		expect(eventsRepository.collection).toHaveLength(0);
	});

	it('does not let an admin reactivate another admin', async () => {
		const actor = await usersRepository.create(
			createUserFactory({ email: 'admin@example.com', role: Roles.admin }),
		);
		const target = await usersRepository.create(
			createUserFactory({ email: 'peer@example.com', role: Roles.admin, status: UserStatuses.suspended }),
		);

		await expect(
			service.execute({ id: target.id, reason, actor: { id: actor.id, role: actor.role } }),
		).rejects.toBeInstanceOf(AdminPeerManagementForbiddenError);
		expect((await usersRepository.findById(target.id))?.status).toBe(UserStatuses.suspended);
	});

	it('rejects a missing target', async () => {
		const actor = await usersRepository.create(
			createUserFactory({ email: 'admin@example.com', role: Roles.admin }),
		);
		await expect(
			service.execute({ id: 'missing-target', reason, actor: { id: actor.id, role: actor.role } }),
		).rejects.toBeInstanceOf(NotFoundError);
	});
});
