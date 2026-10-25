import { resolveUsersRepository, resolveTokensRepository } from '@/core/accounts/infra/mongo/container';
import { resolveEmailQueueProvider } from '@/shared/providers/queue/email';
import { resolveTemplateProvider } from '@/shared/providers/template';
import { resolveCryptoProvider } from '@/shared/providers/cryptography';
import { RequestPasswordResetService } from './RequestPasswordReset.service';
import { resolveDateProvider } from '@/shared/providers/date';

const dateProvider = resolveDateProvider();
const cryptoProvider = resolveCryptoProvider();
const emailQueueProvider = resolveEmailQueueProvider();
const templateProvider = resolveTemplateProvider();
const usersRepository = resolveUsersRepository();
const tokensRepository = resolveTokensRepository();

const requestPasswordResetService = new RequestPasswordResetService(
	usersRepository,
	tokensRepository,
	dateProvider,
	cryptoProvider,
	emailQueueProvider,
	templateProvider,
);
export const resolveRequestPasswordResetService = () => requestPasswordResetService;
