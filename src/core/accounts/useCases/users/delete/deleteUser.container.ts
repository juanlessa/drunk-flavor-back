import {
	resolveUsersRepository,
	resolveTokensRepository,
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
	resolveAdministrativeEventsRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { DeleteUserService } from './DeleteUser.service';

const usersRepository = resolveUsersRepository();
const tokensRepository = resolveTokensRepository();
const credentialsRepository = resolveCredentialsRepository();
const identitiesRepository = resolveIdentitiesRepository();
const transactionManager = resolveTransactionManager();
const administrativeEventsRepository = resolveAdministrativeEventsRepository();

const deleteUserService = new DeleteUserService(
	usersRepository,
	tokensRepository,
	credentialsRepository,
	identitiesRepository,
	transactionManager,
	administrativeEventsRepository,
);
export const resolveDeleteUserService = () => deleteUserService;
