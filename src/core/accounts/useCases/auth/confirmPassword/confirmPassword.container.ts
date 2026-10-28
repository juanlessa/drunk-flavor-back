import {
	resolveUsersRepository,
	resolveTokensRepository,
	resolveCredentialsRepository,
} from '@/core/accounts/infra/mongo/container';
import { ConfirmPasswordService } from './ConfirmPassword.service';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveCryptoProvider, resolveHashProvider } from '@/shared/providers/cryptography';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';

const dateProvider = resolveDateProvider();
const hashProvider = resolveHashProvider();
const cryptoProvider = resolveCryptoProvider();
const usersRepository = resolveUsersRepository();
const tokensRepository = resolveTokensRepository();
const credentialsRepository = resolveCredentialsRepository();

const confirmPasswordService = new ConfirmPasswordService(
	usersRepository,
	tokensRepository,
	credentialsRepository,
	dateProvider,
	hashProvider,
	cryptoProvider,
	resolveTransactionManager(),
);
export const resolveConfirmPasswordService = () => confirmPasswordService;
