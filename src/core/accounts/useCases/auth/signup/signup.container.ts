import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveCryptoProvider, resolveHashProvider } from '@/shared/providers/cryptography';
import { resolveTemplateProvider } from '@/shared/providers/template';
import { resolveEmailQueueProvider } from '@/shared/providers/queue/email';
import { SignupService } from './Signup.service';

const hashProvider = resolveHashProvider();
const cryptoProvider = resolveCryptoProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();
const transactionManager = resolveTransactionManager();
const templateProvider = resolveTemplateProvider();
const emailQueueProvider = resolveEmailQueueProvider();

const signupService = new SignupService(
	usersRepository,
	userTokensRepository,
	transactionManager,
	hashProvider,
	cryptoProvider,
	templateProvider,
	emailQueueProvider,
);
export const resolveSignupService = () => signupService;
