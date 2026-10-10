import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { ResetPasswordService } from './ResetPassword.service';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveCryptoProvider, resolveHashProvider } from '@/shared/providers/cryptography';

const dateProvider = resolveDateProvider();
const hashProvider = resolveHashProvider();
const cryptoProvider = resolveCryptoProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();

const resetPasswordService = new ResetPasswordService(
	usersRepository,
	userTokensRepository,
	dateProvider,
	hashProvider,
	cryptoProvider,
);
export const resolveResetPasswordService = () => resetPasswordService;
