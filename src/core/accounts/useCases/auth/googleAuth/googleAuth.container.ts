import { GoogleAuthService } from './GoogleAuth.service';
import { resolveUsersRepository, resolveIdentitiesRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveGoogleIdentityProvider } from '@/shared/providers/googleAuth';

const googleIdentityProvider = resolveGoogleIdentityProvider();
const usersRepository = resolveUsersRepository();
const identitiesRepository = resolveIdentitiesRepository();
const transactionManager = resolveTransactionManager();

const googleAuthService = new GoogleAuthService(
	googleIdentityProvider,
	usersRepository,
	identitiesRepository,
	transactionManager,
);

export const resolveGoogleAuthService = () => googleAuthService;
