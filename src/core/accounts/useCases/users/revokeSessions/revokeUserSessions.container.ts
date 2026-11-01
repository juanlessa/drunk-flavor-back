import { resolveAdministrativeEventsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveEmailQueueProvider } from '@/shared/providers/queue/email';
import { resolveTemplateProvider } from '@/shared/providers/template';
import { RevokeUserSessionsService } from './RevokeUserSessions.service';

const service = new RevokeUserSessionsService(
	resolveUsersRepository(),
	resolveTransactionManager(),
	resolveAdministrativeEventsRepository(),
	resolveTemplateProvider(),
	resolveEmailQueueProvider(),
);

export const resolveRevokeUserSessionsService = () => service;
