import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { ConfirmPasswordService } from './ConfirmPassword.service';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveCryptoProvider, resolveHashProvider } from '@/shared/providers/cryptography';

const dateProvider = resolveDateProvider();
const hashProvider = resolveHashProvider();
const cryptoProvider = resolveCryptoProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();

const confirmPasswordService = new ConfirmPasswordService(
	usersRepository,
	userTokensRepository,
	dateProvider,
	hashProvider,
	cryptoProvider,
);
export const resolveConfirmPasswordService = () => confirmPasswordService;
