import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	AdministrativeEventActions,
	AdministrativeEventOrigins,
} from '@/core/accounts/constants/administrativeEvent.constants';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { UserStatus } from '@/core/accounts/entities/user.entity';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import {
	AdminPeerManagementForbiddenError,
	OwnerManagementRequiresTransferError,
	UserAdministrationForbiddenError,
	UserSelfAdministrationForbiddenError,
	UserStatusTransitionInvalidError,
} from '@/core/accounts/errors/user.errors';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { AdministrativeEventsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/AdministrativeEvents.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { Roles } from '@/shared/accessControl/roles';
import { MAIL_SENDERS } from '@/shared/constants/mailer.constants';
import { NotFoundError } from '@/shared/error/error.lib';
import { logger } from '@/shared/providers/logger';
import { MockEmailQueueProvider } from '@/shared/providers/queue/email/implementations/MockEmailQueue.provider';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { ITransactionManager, TransactionWork } from '@/shared/transactions/ITransactionManager';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { RevokeUserSessionsService } from './RevokeUserSessions.service';

const reason = 'Security review requires ending every existing session';
let usersRepository: UsersRepositoryInMemory;
let eventsRepository: AdministrativeEventsRepositoryInMemory;
let templateProvider: ITemplateProvider;
let emailQueueProvider: MockEmailQueueProvider;
let service: RevokeUserSessionsService;

const createService = (transactionManager: ITransactionManager = new FakeTransactionManager()) =>
	new RevokeUserSessionsService(
		usersRepository,
		transactionManager,
		eventsRepository,
		templateProvider,
		emailQueueProvider,
	);

beforeEach(() => {
	usersRepository = new UsersRepositoryInMemory();
	eventsRepository = new AdministrativeEventsRepositoryInMemory();
	templateProvider = {
		emailVerification: vi.fn(async () => 'verification-template'),
		forgotPassword: vi.fn(async () => 'password-template'),
		ownershipTransferInvitation: vi.fn(async () => 'invitation-template'),
		ownershipTransferChanged: vi.fn(async () => 'changed-template'),
		userSessionsRevoked: vi.fn(async () => '<html>security notice</html>'),
	};
	emailQueueProvider = new MockEmailQueueProvider();
	service = createService();
});

const createParticipants = async (targetStatus: UserStatus = UserStatuses.active) => {
	const actor = await usersRepository.create(
		createUserFactory({ email: 'owner@example.com', role: Roles.owner, sessionVersion: 4 }),
	);
	const target = await usersRepository.create(
		createUserFactory({
			email: 'target@example.com',
			role: Roles.member,
			status: targetStatus,
			sessionVersion: 6,
		}),
	);
	return { actor, target };
};

describe('RevokeUserSessionsService', () => {
	it.each([UserStatuses.active, UserStatuses.suspended])(
		'increments and audits an eligible %s target before enqueueing one private notification',
		async (status) => {
			const { actor, target } = await createParticipants(status);

			await service.execute({
				id: target.id,
				reason,
				actor: { id: actor.id, role: actor.role, sessionVersion: actor.sessionVersion },
				administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: 'request-id' },
			});

			expect(await usersRepository.findById(target.id)).toMatchObject({
				role: target.role,
				status,
				sessionVersion: 7,
			});
			expect(eventsRepository.collection).toEqual([
				expect.objectContaining({
					actorId: actor.id,
					targetUserId: target.id,
					action: AdministrativeEventActions.userSessionsRevoked,
					before: { role: target.role, status },
					after: { role: target.role, status },
					origin: AdministrativeEventOrigins.api,
					requestId: 'request-id',
					reason,
				}),
			]);
			expect(templateProvider.userSessionsRevoked).toHaveBeenCalledWith({ userName: target.name });
			expect(emailQueueProvider.addMock).toHaveBeenCalledWith(EMAIL_JOB_NAMES.userSessionsRevoked, {
				to: target.email,
				from: MAIL_SENDERS.noReply,
				subject: 'Your Drunk Flavor sessions were ended',
				html: '<html>security notice</html>',
			});
			const templateInput = vi.mocked(templateProvider.userSessionsRevoked).mock.calls[0][0];
			const queueInput = emailQueueProvider.addMock.mock.calls[0][1];
			expect({ templateInput, queueInput }).not.toHaveProperty('actor');
			expect(JSON.stringify({ templateInput, queueInput })).not.toContain(reason);
		},
	);

	it('treats every accepted call as a new revocation boundary', async () => {
		const { actor, target } = await createParticipants(UserStatuses.suspended);
		const command = {
			id: target.id,
			reason,
			actor: { id: actor.id, role: actor.role, sessionVersion: actor.sessionVersion },
		};

		await service.execute(command);
		await service.execute(command);

		expect((await usersRepository.findById(target.id))?.sessionVersion).toBe(8);
		expect(eventsRepository.collection).toHaveLength(2);
		expect(templateProvider.userSessionsRevoked).toHaveBeenCalledTimes(2);
		expect(emailQueueProvider.addMock).toHaveBeenCalledTimes(2);
	});

	it('uses the reloaded actor role instead of command claims', async () => {
		const actor = await usersRepository.create(
			createUserFactory({ email: 'member@example.com', role: Roles.member }),
		);
		const target = await usersRepository.create(createUserFactory({ email: 'target@example.com' }));

		await expect(
			service.execute({
				id: target.id,
				reason,
				actor: { id: actor.id, role: Roles.owner, sessionVersion: actor.sessionVersion },
			}),
		).rejects.toBeInstanceOf(UserAdministrationForbiddenError);
		expect((await usersRepository.findById(target.id))?.sessionVersion).toBe(target.sessionVersion);
	});

	it('rejects a missing actor before target effects', async () => {
		const { target } = await createParticipants();

		await expect(
			service.execute({
				id: target.id,
				reason,
				actor: { id: 'missing', role: Roles.owner, sessionVersion: 1 },
			}),
		).rejects.toBeInstanceOf(NotFoundError);

		expect((await usersRepository.findById(target.id))?.sessionVersion).toBe(target.sessionVersion);
		expect(eventsRepository.collection).toHaveLength(0);
		expect(templateProvider.userSessionsRevoked).not.toHaveBeenCalled();
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it.each([UserStatuses.suspended, UserStatuses.incomplete_profile])(
		'rejects a %s actor before target effects',
		async (actorStatus) => {
			const { actor, target } = await createParticipants();
			await usersRepository.update({ id: actor.id, status: actorStatus });

			await expect(
				service.execute({
					id: target.id,
					reason,
					actor: { id: actor.id, role: actor.role, sessionVersion: actor.sessionVersion },
				}),
			).rejects.toBeInstanceOf(SessionRevokedError);

			expect((await usersRepository.findById(target.id))?.sessionVersion).toBe(target.sessionVersion);
			expect(eventsRepository.collection).toHaveLength(0);
			expect(templateProvider.userSessionsRevoked).not.toHaveBeenCalled();
			expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
		},
	);

	it('rejects a stale actor session before target effects', async () => {
		const { actor, target } = await createParticipants();
		await usersRepository.update({ id: actor.id, sessionVersion: actor.sessionVersion + 1 });

		await expect(
			service.execute({
				id: target.id,
				reason,
				actor: { id: actor.id, role: actor.role, sessionVersion: actor.sessionVersion },
			}),
		).rejects.toBeInstanceOf(SessionRevokedError);

		expect((await usersRepository.findById(target.id))?.sessionVersion).toBe(target.sessionVersion);
		expect(eventsRepository.collection).toHaveLength(0);
		expect(templateProvider.userSessionsRevoked).not.toHaveBeenCalled();
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('rejects a missing target before persistence or notification', async () => {
		const actor = await usersRepository.create(createUserFactory({ role: Roles.owner }));
		await expect(
			service.execute({
				id: 'missing',
				reason,
				actor: { id: actor.id, role: actor.role, sessionVersion: actor.sessionVersion },
			}),
		).rejects.toBeInstanceOf(NotFoundError);
		expect(eventsRepository.collection).toHaveLength(0);
		expect(templateProvider.userSessionsRevoked).not.toHaveBeenCalled();
	});

	it.each([
		['self', Roles.owner, Roles.owner, UserStatuses.active, UserSelfAdministrationForbiddenError],
		['owner target', Roles.admin, Roles.owner, UserStatuses.active, OwnerManagementRequiresTransferError],
		['admin peer', Roles.admin, Roles.admin, UserStatuses.active, AdminPeerManagementForbiddenError],
		['regular actor', Roles.member, Roles.partner, UserStatuses.active, UserAdministrationForbiddenError],
		['invalid target status', Roles.owner, Roles.member, UserStatuses.pending, UserStatusTransitionInvalidError],
	] as const)('rejects %s without side effects', async (caseName, actorRole, targetRole, targetStatus, ErrorType) => {
		const actor = await usersRepository.create(
			createUserFactory({ email: `${caseName}@actor.test`, role: actorRole }),
		);
		const target =
			caseName === 'self'
				? actor
				: await usersRepository.create(
						createUserFactory({ email: `${caseName}@target.test`, role: targetRole, status: targetStatus }),
					);

		await expect(
			service.execute({
				id: target.id,
				reason,
				actor: { id: actor.id, role: actor.role, sessionVersion: actor.sessionVersion },
			}),
		).rejects.toBeInstanceOf(ErrorType);
		expect((await usersRepository.findById(target.id))?.sessionVersion).toBe(target.sessionVersion);
		expect(eventsRepository.collection).toHaveLength(0);
		expect(templateProvider.userSessionsRevoked).not.toHaveBeenCalled();
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('rejects increment and event failures without notification', async () => {
		const { actor, target } = await createParticipants();
		const command = {
			id: target.id,
			reason,
			actor: { id: actor.id, role: actor.role, sessionVersion: actor.sessionVersion },
		};
		const incrementFailure = new Error('increment failed');
		vi.spyOn(usersRepository, 'incrementSessionVersion').mockRejectedValueOnce(incrementFailure);
		await expect(service.execute(command)).rejects.toBe(incrementFailure);
		expect(eventsRepository.collection).toHaveLength(0);

		const eventFailure = new Error('event failed');
		vi.spyOn(eventsRepository, 'create').mockRejectedValueOnce(eventFailure);
		await expect(service.execute(command)).rejects.toBe(eventFailure);
		expect(templateProvider.userSessionsRevoked).not.toHaveBeenCalled();
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it.each(['template', 'queue'] as const)(
		'preserves success when %s setup fails and logs only target context',
		async (stage) => {
			const { actor, target } = await createParticipants();
			const failure = new Error(`${stage} unavailable`);
			if (stage === 'template') {
				vi.mocked(templateProvider.userSessionsRevoked).mockRejectedValueOnce(failure);
			} else {
				emailQueueProvider.addMock.mockRejectedValueOnce(failure);
			}
			const loggerSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined);

			await expect(
				service.execute({
					id: target.id,
					reason,
					actor: { id: actor.id, role: actor.role, sessionVersion: actor.sessionVersion },
				}),
			).resolves.toBeUndefined();

			expect((await usersRepository.findById(target.id))?.sessionVersion).toBe(7);
			expect(eventsRepository.collection).toHaveLength(1);
			expect(loggerSpy).toHaveBeenCalledWith(
				{ err: failure, userId: target.id },
				'Unable to enqueue user sessions revoked notification',
			);
			expect(JSON.stringify(loggerSpy.mock.calls)).not.toContain(reason);
			expect(JSON.stringify(loggerSpy.mock.calls)).not.toContain(actor.id);
		},
	);

	it('starts notification rendering only after the transaction resolves', async () => {
		const { actor, target } = await createParticipants();
		let transactionResolved = false;
		const transactionManager: ITransactionManager = {
			async withTransaction<TResult>(work: TransactionWork<TResult>): Promise<TResult> {
				const result = await work();
				transactionResolved = true;
				return result;
			},
		};
		const withTransactionSpy = vi.spyOn(transactionManager, 'withTransaction');
		service = createService(transactionManager);
		vi.mocked(templateProvider.userSessionsRevoked).mockImplementation(async () => {
			expect(transactionResolved).toBe(true);
			return '<html>security notice</html>';
		});

		await service.execute({
			id: target.id,
			reason,
			actor: { id: actor.id, role: actor.role, sessionVersion: actor.sessionVersion },
		});

		expect(withTransactionSpy).toHaveBeenCalledTimes(1);
		expect(templateProvider.userSessionsRevoked).toHaveBeenCalledTimes(1);
	});
});
