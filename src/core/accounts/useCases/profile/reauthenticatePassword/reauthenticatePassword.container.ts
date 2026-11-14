import { resolveCredentialsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveHashProvider } from '@/shared/providers/cryptography';
import { resolveDateProvider } from '@/shared/providers/date';
import { ReauthenticatePasswordService } from './ReauthenticatePassword.service';

const usersRepository = resolveUsersRepository();
const credentialsRepository = resolveCredentialsRepository();
const hashProvider = resolveHashProvider();
const dateProvider = resolveDateProvider();

const reauthenticatePasswordService = new ReauthenticatePasswordService(
	usersRepository,
	credentialsRepository,
	hashProvider,
	dateProvider,
);

export const resolveReauthenticatePasswordService = () => reauthenticatePasswordService;
