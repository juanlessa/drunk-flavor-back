import {
	resolveUsersRepository,
	resolveTokensRepository,
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { DeleteProfileService } from './DeleteProfile.service';

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
);
export const resolveDeleteProfileService = () => deleteProfileService;
