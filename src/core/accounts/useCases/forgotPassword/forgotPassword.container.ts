import { resolveUsersRepository, resolveUsersTokensRepository } from '@/core/accounts/infra/mongo/container';
import { resolveMailerProvider } from '@/shared/providers/mailer';
import { resolveTemplateProvider } from '@/shared/providers/template';
import { resolveCryptoProvider } from '@/shared/providers/cryptography';
import { ForgotPasswordService } from './ForgotPassword.service';
import { resolveDateProvider } from '@/shared/providers/date';

const dateProvider = resolveDateProvider();
const cryptoProvider = resolveCryptoProvider();
const mailerProvider = resolveMailerProvider();
const templateProvider = resolveTemplateProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUsersTokensRepository();

const forgotPasswordService = new ForgotPasswordService(
	usersRepository,
	userTokensRepository,
	dateProvider,
	cryptoProvider,
	mailerProvider,
	templateProvider,
);
export const resolveForgotPasswordService = () => forgotPasswordService;
