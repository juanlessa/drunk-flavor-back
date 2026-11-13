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
import { DeleteProfileService } from './DeleteProfile.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const usersRepository = resolveUsersRepository();
const tokensRepository = resolveTokensRepository();
const credentialsRepository = resolveCredentialsRepository();
const identitiesRepository = resolveIdentitiesRepository();
const transactionManager = resolveTransactionManager();
const storageProvider = resolveStorageProvider();
const administrativeEventsRepository = resolveAdministrativeEventsRepository();
const engagementModule = resolveEngagementModule();
const drinksModule = resolveDrinksModule();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();

const deleteProfileService = new DeleteProfileService(
	usersRepository,
	tokensRepository,
	credentialsRepository,
	identitiesRepository,
	transactionManager,
	storageProvider,
	administrativeEventsRepository,
	engagementModule,
	drinksModule,
	sessionVersionMarkerStore,
);

export const resolveDeleteProfileService = () => deleteProfileService;
