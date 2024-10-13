import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { resolveCryptoProvider, resolveHashProvider } from '@/shared/providers/cryptography';
import { SignupService } from './Signup.service';
import { resolveMailerProvider } from '@/shared/providers/mailer';
import { resolveTemplateProvider } from '@/shared/providers/template';
import { resolveDateProvider } from '@/shared/providers/date';

const dateProvider = resolveDateProvider();
const hashProvider = resolveHashProvider();
const cryptoProvider = resolveCryptoProvider();
const mailerProvider = resolveMailerProvider();
const templateProvider = resolveTemplateProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();

const signupService = new SignupService(
	usersRepository,
	userTokensRepository,
	dateProvider,
	hashProvider,
	cryptoProvider,
	mailerProvider,
	templateProvider,
);
export const resolveSignupService = () => signupService;
