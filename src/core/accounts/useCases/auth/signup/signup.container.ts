import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveCryptoProvider, resolveHashProvider } from '@/shared/providers/cryptography';
import { SignupService } from './Signup.service';
import { resolveDateProvider } from '@/shared/providers/date';

const dateProvider = resolveDateProvider();
const hashProvider = resolveHashProvider();
const cryptoProvider = resolveCryptoProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();
const transactionManager = resolveTransactionManager();

const signupService = new SignupService(
	usersRepository,
	userTokensRepository,
	transactionManager,
	dateProvider,
	hashProvider,
	cryptoProvider,
);
export const resolveSignupService = () => signupService;
