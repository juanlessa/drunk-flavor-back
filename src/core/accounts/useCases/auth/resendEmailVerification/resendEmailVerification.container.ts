import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { resolveCryptoProvider } from '@/shared/providers/cryptography';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveTemplateProvider } from '@/shared/providers/template';
import { resolveEmailQueueProvider } from '@/shared/providers/queue/email';
import { ResendEmailVerificationService } from './ResendEmailVerification.service';

const dateProvider = resolveDateProvider();
const cryptoProvider = resolveCryptoProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();
const templateProvider = resolveTemplateProvider();
const emailQueueProvider = resolveEmailQueueProvider();

const resendEmailVerificationService = new ResendEmailVerificationService(
	usersRepository,
	userTokensRepository,
	dateProvider,
	cryptoProvider,
	templateProvider,
	emailQueueProvider,
);
export const resolveResendEmailVerificationService = () => resendEmailVerificationService;
