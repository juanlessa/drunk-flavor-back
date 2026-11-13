import {
	resolveAdministrativeEventsRepository,
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
	resolveTokensRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveCleanupQueueProvider } from '@/shared/providers/queue/cleanup';
import { DeleteProfileService } from './DeleteProfile.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const usersRepository = resolveUsersRepository();
const tokensRepository = resolveTokensRepository();
const credentialsRepository = resolveCredentialsRepository();
const identitiesRepository = resolveIdentitiesRepository();
const transactionManager = resolveTransactionManager();
const administrativeEventsRepository = resolveAdministrativeEventsRepository();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();
const cleanupQueueProvider = resolveCleanupQueueProvider();

const deleteProfileService = new DeleteProfileService(
	usersRepository,
	tokensRepository,
	credentialsRepository,
	identitiesRepository,
	transactionManager,
	administrativeEventsRepository,
	sessionVersionMarkerStore,
	cleanupQueueProvider,
);

export const resolveDeleteProfileService = () => deleteProfileService;
