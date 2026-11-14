import { resolveUsersRepository, resolveCredentialsRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveHashProvider } from '@/shared/providers/cryptography';
import { UpdatePasswordService } from './updatePassword.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const usersRepository = resolveUsersRepository();
const credentialsRepository = resolveCredentialsRepository();
const hashProvider = resolveHashProvider();
const transactionManager = resolveTransactionManager();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();

const updatePasswordService = new UpdatePasswordService(
	usersRepository,
	credentialsRepository,
	hashProvider,
	transactionManager,
	sessionVersionMarkerStore,
);

export const resolveUpdatePasswordService = () => updatePasswordService;
