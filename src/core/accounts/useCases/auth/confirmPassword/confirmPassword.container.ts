import {
	resolveUsersRepository,
	resolveTokensRepository,
	resolveCredentialsRepository,
} from '@/core/accounts/infra/mongo/container';
import { ConfirmPasswordService } from './ConfirmPassword.service';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveCryptoProvider, resolveHashProvider } from '@/shared/providers/cryptography';

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
);
export const resolveConfirmPasswordService = () => confirmPasswordService;
