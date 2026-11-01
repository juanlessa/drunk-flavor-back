import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdministrativeEventModel } from '@/core/accounts/infra/mongo/entities/administrativeEvent.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { AdministrativeEventsRepository } from '@/core/accounts/infra/mongo/repositories/AdministrativeEvents.repository';
import { UsersRepository } from '@/core/accounts/infra/mongo/repositories/Users.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { Roles } from '@/shared/accessControl/roles';
import { MockEmailQueueProvider } from '@/shared/providers/queue/email/implementations/MockEmailQueue.provider';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { MongoTransactionManager } from '@/infrastructure/mongo/transactions/MongoTransactionManager';
import { RevokeUserSessionsService } from './RevokeUserSessions.service';

let usersRepository: UsersRepository;
let eventsRepository: AdministrativeEventsRepository;
let templateProvider: ITemplateProvider;
let emailQueueProvider: MockEmailQueueProvider;

beforeEach(() => {
	usersRepository = new UsersRepository();
	eventsRepository = new AdministrativeEventsRepository();
	templateProvider = {
		emailVerification: vi.fn(async () => ''),
		forgotPassword: vi.fn(async () => ''),
		ownershipTransferInvitation: vi.fn(async () => ''),
		ownershipTransferChanged: vi.fn(async () => ''),
		userSessionsRevoked: vi.fn(async () => ''),
	};
	emailQueueProvider = new MockEmailQueueProvider();
});

afterEach(async () => {
	await UserModel.deleteMany({});
	await AdministrativeEventModel.deleteMany({});
});

describe('RevokeUserSessionsService (integration)', () => {
	it('rolls back the atomic increment when event creation fails', async () => {
		const actor = await usersRepository.create(
			createUserFactory({ email: 'owner@example.com', role: Roles.owner, sessionVersion: 2 }),
		);
		const target = await usersRepository.create(
			createUserFactory({ email: 'target@example.com', sessionVersion: 5 }),
		);
		const failure = new Error('event persistence failed');
		vi.spyOn(eventsRepository, 'create').mockRejectedValue(failure);
		const service = new RevokeUserSessionsService(
			usersRepository,
			new MongoTransactionManager(),
			eventsRepository,
			templateProvider,
			emailQueueProvider,
		);

		await expect(
			service.execute({
				id: target.id,
				reason: 'Security review requires ending all sessions',
				actor: { id: actor.id, role: actor.role, sessionVersion: actor.sessionVersion },
			}),
		).rejects.toBe(failure);

		expect(await UserModel.findById(target.id).lean()).toMatchObject({ session_version: 5 });
		expect(await AdministrativeEventModel.countDocuments({})).toBe(0);
		expect(templateProvider.userSessionsRevoked).not.toHaveBeenCalled();
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});
});
