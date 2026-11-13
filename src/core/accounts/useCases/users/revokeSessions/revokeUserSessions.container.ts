import { resolveAdministrativeEventsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveEmailQueueProvider } from '@/shared/providers/queue/email';
import { resolveTemplateProvider } from '@/shared/providers/template';
import { RevokeUserSessionsService } from './RevokeUserSessions.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const usersRepository = resolveUsersRepository();
const transactionManager = resolveTransactionManager();
const administrativeEventsRepository = resolveAdministrativeEventsRepository();
const templateProvider = resolveTemplateProvider();
const emailQueueProvider = resolveEmailQueueProvider();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();

const revokeUserSessionsService = new RevokeUserSessionsService(
	usersRepository,
	transactionManager,
	administrativeEventsRepository,
	templateProvider,
	emailQueueProvider,
	sessionVersionMarkerStore,
);

export const resolveRevokeUserSessionsService = () => revokeUserSessionsService;
