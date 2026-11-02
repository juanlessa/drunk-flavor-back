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
import { DeleteProfileService } from './DeleteProfile.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const deleteProfileService = new DeleteProfileService(
	resolveUsersRepository(),
	resolveTokensRepository(),
	resolveCredentialsRepository(),
	resolveIdentitiesRepository(),
	resolveTransactionManager(),
	resolveStorageProvider(),
	resolveAdministrativeEventsRepository(),
	resolveEngagementModule(),
	resolveSessionVersionMarkerStore(),
);

export const resolveDeleteProfileService = () => deleteProfileService;
