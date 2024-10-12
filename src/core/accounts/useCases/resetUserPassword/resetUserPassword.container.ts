import { resolveUsersRepository, resolveUsersTokensRepository } from '@/core/accounts/infra/mongo/container';
import { ResetUserPasswordService } from './resetUserPassword.service';
import { resolveMailerProvider } from '@/shared/providers/mailer';
import { resolveTemplateProvider } from '@/shared/providers/template';
import { resolveCryptoProvider } from '@/shared/providers/cryptography';

const cryptoProvider = resolveCryptoProvider();
const mailerProvider = resolveMailerProvider();
const templateProvider = resolveTemplateProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUsersTokensRepository();

const resetUserPasswordService = new ResetUserPasswordService(
	usersRepository,
	userTokensRepository,
	cryptoProvider,
	mailerProvider,
	templateProvider,
);
export const resolveResetUserPasswordService = () => resetUserPasswordService;
