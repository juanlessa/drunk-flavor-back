import {
	resolveUsersRepository,
	resolveTokensRepository,
	resolveCredentialsRepository,
} from '@/core/accounts/infra/mongo/container';
import { ConfirmPasswordService } from './ConfirmPassword.service';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveCryptoProvider, resolveHashProvider } from '@/shared/providers/cryptography';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const usersRepository = resolveUsersRepository();
const tokensRepository = resolveTokensRepository();
const credentialsRepository = resolveCredentialsRepository();
const dateProvider = resolveDateProvider();
const hashProvider = resolveHashProvider();
const cryptoProvider = resolveCryptoProvider();
const transactionManager = resolveTransactionManager();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();

const confirmPasswordService = new ConfirmPasswordService(
	usersRepository,
	tokensRepository,
	credentialsRepository,
	dateProvider,
	hashProvider,
	cryptoProvider,
	transactionManager,
	sessionVersionMarkerStore,
);

export const resolveConfirmPasswordService = () => confirmPasswordService;
