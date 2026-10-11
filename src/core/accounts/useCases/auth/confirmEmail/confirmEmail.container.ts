import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { ConfirmEmailService } from './ConfirmEmail.service';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveCryptoProvider } from '@/shared/providers/cryptography';

const dateProvider = resolveDateProvider();
const cryptoProvider = resolveCryptoProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();

const confirmEmailService = new ConfirmEmailService(
	usersRepository,
	userTokensRepository,
	dateProvider,
	cryptoProvider,
);
export const resolveConfirmEmailService = () => confirmEmailService;
