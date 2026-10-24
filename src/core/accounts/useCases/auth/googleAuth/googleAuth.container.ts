import { GoogleAuthService } from './GoogleAuth.service';
import { resolveUsersRepository, resolveIdentitiesRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveGoogleTokenVerifier } from '@/shared/providers/googleAuth';

const googleTokenVerifier = resolveGoogleTokenVerifier();
const usersRepository = resolveUsersRepository();
const identitiesRepository = resolveIdentitiesRepository();
const transactionManager = resolveTransactionManager();

const googleAuthService = new GoogleAuthService(
	googleTokenVerifier,
	usersRepository,
	identitiesRepository,
	transactionManager,
);
export const resolveGoogleAuthService = () => googleAuthService;
