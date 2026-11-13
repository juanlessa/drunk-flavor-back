import { resolveUsersRepository, resolveTokensRepository } from '@/core/accounts/infra/mongo/container';
import { ConfirmEmailService } from './ConfirmEmail.service';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveCryptoProvider } from '@/shared/providers/cryptography';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const usersRepository = resolveUsersRepository();
const tokensRepository = resolveTokensRepository();
const dateProvider = resolveDateProvider();
const cryptoProvider = resolveCryptoProvider();
const transactionManager = resolveTransactionManager();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();

const confirmEmailService = new ConfirmEmailService(
	usersRepository,
	tokensRepository,
	dateProvider,
	cryptoProvider,
	transactionManager,
	sessionVersionMarkerStore,
);

export const resolveConfirmEmailService = () => confirmEmailService;
