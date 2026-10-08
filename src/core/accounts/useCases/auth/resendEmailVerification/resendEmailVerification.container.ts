import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { resolveCryptoProvider } from '@/shared/providers/cryptography';
import { resolveDateProvider } from '@/shared/providers/date';
import { ResendEmailVerificationService } from './ResendEmailVerification.service';

const dateProvider = resolveDateProvider();
const cryptoProvider = resolveCryptoProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();

const resendEmailVerificationService = new ResendEmailVerificationService(
	usersRepository,
	userTokensRepository,
	dateProvider,
	cryptoProvider,
);
export const resolveResendEmailVerificationService = () => resendEmailVerificationService;
