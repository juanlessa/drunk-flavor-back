import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { CreateUserService } from './CreateUser.service';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveCryptoProvider, resolveHashProvider } from '@/shared/providers/cryptography';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveTemplateProvider } from '@/shared/providers/template';
import { resolveEmailQueueProvider } from '@/shared/providers/queue/email';

const dateProvider = resolveDateProvider();
const hashProvider = resolveHashProvider();
const cryptoProvider = resolveCryptoProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();
const transactionManager = resolveTransactionManager();
const templateProvider = resolveTemplateProvider();
const emailQueueProvider = resolveEmailQueueProvider();

const createUserService = new CreateUserService(
	usersRepository,
	userTokensRepository,
	transactionManager,
	dateProvider,
	hashProvider,
	cryptoProvider,
	templateProvider,
	emailQueueProvider,
);
export const resolveCreateUserService = () => createUserService;
