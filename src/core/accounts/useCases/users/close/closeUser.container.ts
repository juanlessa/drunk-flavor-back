import {
	resolveAdministrativeEventsRepository,
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
	resolveTokensRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveCleanupQueueProvider } from '@/shared/providers/queue/cleanup';
import { CloseUserService } from './CloseUser.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const usersRepository = resolveUsersRepository();
const credentialsRepository = resolveCredentialsRepository();
const identitiesRepository = resolveIdentitiesRepository();
const tokensRepository = resolveTokensRepository();
const administrativeEventsRepository = resolveAdministrativeEventsRepository();
const transactionManager = resolveTransactionManager();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();
const cleanupQueueProvider = resolveCleanupQueueProvider();

const closeUserService = new CloseUserService(
	usersRepository,
	credentialsRepository,
	identitiesRepository,
	tokensRepository,
	administrativeEventsRepository,
	transactionManager,
	sessionVersionMarkerStore,
	cleanupQueueProvider,
);

export const resolveCloseUserService = () => closeUserService;
