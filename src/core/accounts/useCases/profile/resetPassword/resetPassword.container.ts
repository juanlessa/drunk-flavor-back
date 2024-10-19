import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { ResetPasswordService } from './ResetPassword.service';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveHashProvider } from '@/shared/providers/cryptography';

const dateProvider = resolveDateProvider();
const hashProvider = resolveHashProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();

const resetPasswordService = new ResetPasswordService(
	usersRepository,
	userTokensRepository,
	dateProvider,
	hashProvider,
);
export const resolveResetPasswordService = () => resetPasswordService;
