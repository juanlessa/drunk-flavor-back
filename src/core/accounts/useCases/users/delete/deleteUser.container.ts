import {
	resolveUsersRepository,
	resolveTokensRepository,
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { DeleteUserService } from './DeleteUser.service';

const usersRepository = resolveUsersRepository();
const tokensRepository = resolveTokensRepository();
const credentialsRepository = resolveCredentialsRepository();
const identitiesRepository = resolveIdentitiesRepository();
const transactionManager = resolveTransactionManager();

const deleteUserService = new DeleteUserService(
	usersRepository,
	tokensRepository,
	credentialsRepository,
	identitiesRepository,
	transactionManager,
);
export const resolveDeleteUserService = () => deleteUserService;
