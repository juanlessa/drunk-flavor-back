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

const closeUserService = new CloseUserService(
	resolveUsersRepository(),
	resolveCredentialsRepository(),
	resolveIdentitiesRepository(),
	resolveTokensRepository(),
	resolveAdministrativeEventsRepository(),
	resolveEngagementModule(),
	resolveDrinksModule(),
	resolveTransactionManager(),
	resolveStorageProvider(),
	resolveSessionVersionMarkerStore(),
);

export const resolveCloseUserService = () => closeUserService;
