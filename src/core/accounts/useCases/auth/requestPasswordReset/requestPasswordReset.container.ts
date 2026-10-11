import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { resolveMailerProvider } from '@/shared/providers/mailer';
import { resolveTemplateProvider } from '@/shared/providers/template';
import { resolveCryptoProvider } from '@/shared/providers/cryptography';
import { RequestPasswordResetService } from './RequestPasswordReset.service';
import { resolveDateProvider } from '@/shared/providers/date';

const dateProvider = resolveDateProvider();
const cryptoProvider = resolveCryptoProvider();
const mailerProvider = resolveMailerProvider();
const templateProvider = resolveTemplateProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();

const requestPasswordResetService = new RequestPasswordResetService(
	usersRepository,
	userTokensRepository,
	dateProvider,
	cryptoProvider,
	mailerProvider,
	templateProvider,
);
export const resolveRequestPasswordResetService = () => requestPasswordResetService;
