import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { CreateUserService } from './CreateUser.service';
import { resolveCryptoProvider, resolveHashProvider } from '@/shared/providers/cryptography';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveMailerProvider } from '@/shared/providers/mailer';
import { resolveTemplateProvider } from '@/shared/providers/template';

const dateProvider = resolveDateProvider();
const hashProvider = resolveHashProvider();
const cryptoProvider = resolveCryptoProvider();
const mailerProvider = resolveMailerProvider();
const templateProvider = resolveTemplateProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();

const createUserService = new CreateUserService(
	usersRepository,
	userTokensRepository,
	dateProvider,
	hashProvider,
	cryptoProvider,
	mailerProvider,
	templateProvider,
);
export const resolveCreateUserService = () => createUserService;
