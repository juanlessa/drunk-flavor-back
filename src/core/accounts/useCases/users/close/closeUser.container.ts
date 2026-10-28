import {
	resolveAdministrativeEventsRepository,
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
	resolveTokensRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveEngagementModule } from '@/core/engagement/public';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { CloseUserService } from './CloseUser.service';

const closeUserService = new CloseUserService(
	resolveUsersRepository(),
	resolveCredentialsRepository(),
	resolveIdentitiesRepository(),
	resolveTokensRepository(),
	resolveAdministrativeEventsRepository(),
	resolveEngagementModule(),
	resolveTransactionManager(),
	resolveStorageProvider(),
);

export const resolveCloseUserService = () => closeUserService;
