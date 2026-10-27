import {
	resolveUsersRepository,
	resolveTokensRepository,
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { DeleteProfileService } from './DeleteProfile.service';
import { resolveStorageProvider } from '@/shared/providers/storage';

const usersRepository = resolveUsersRepository();
const tokensRepository = resolveTokensRepository();
const credentialsRepository = resolveCredentialsRepository();
const identitiesRepository = resolveIdentitiesRepository();
const transactionManager = resolveTransactionManager();

const deleteProfileService = new DeleteProfileService(
	usersRepository,
	tokensRepository,
	credentialsRepository,
	identitiesRepository,
	transactionManager,
	resolveStorageProvider(),
);
export const resolveDeleteProfileService = () => deleteProfileService;
