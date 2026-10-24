import {
	resolveUsersRepository,
	resolveTokensRepository,
	resolveCredentialsRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveCryptoProvider, resolveHashProvider } from '@/shared/providers/cryptography';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveTemplateProvider } from '@/shared/providers/template';
import { resolveEmailQueueProvider } from '@/shared/providers/queue/email';
import { SignupService } from './Signup.service';

const dateProvider = resolveDateProvider();
const hashProvider = resolveHashProvider();
const cryptoProvider = resolveCryptoProvider();
const usersRepository = resolveUsersRepository();
const tokensRepository = resolveTokensRepository();
const credentialsRepository = resolveCredentialsRepository();
const transactionManager = resolveTransactionManager();
const templateProvider = resolveTemplateProvider();
const emailQueueProvider = resolveEmailQueueProvider();

const signupService = new SignupService(
	usersRepository,
	tokensRepository,
	credentialsRepository,
	transactionManager,
	dateProvider,
	hashProvider,
	cryptoProvider,
	templateProvider,
	emailQueueProvider,
);
export const resolveSignupService = () => signupService;
