import {
	resolveAdministrativeEventsRepository,
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
	resolveTokensRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveDrinksModule } from '@/core/drinks/public';
import { resolveEngagementModule } from '@/core/engagement/public';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { CloseUserService } from './CloseUser.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const usersRepository = resolveUsersRepository();
const credentialsRepository = resolveCredentialsRepository();
const identitiesRepository = resolveIdentitiesRepository();
const tokensRepository = resolveTokensRepository();
const administrativeEventsRepository = resolveAdministrativeEventsRepository();
const engagementModule = resolveEngagementModule();
const drinksModule = resolveDrinksModule();
const transactionManager = resolveTransactionManager();
const storageProvider = resolveStorageProvider();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();

const closeUserService = new CloseUserService(
	usersRepository,
	credentialsRepository,
	identitiesRepository,
	tokensRepository,
	administrativeEventsRepository,
	engagementModule,
	drinksModule,
	transactionManager,
	storageProvider,
	sessionVersionMarkerStore,
);

export const resolveCloseUserService = () => closeUserService;
