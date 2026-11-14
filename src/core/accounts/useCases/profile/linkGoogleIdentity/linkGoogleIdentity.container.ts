import { resolveIdentitiesRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveGoogleIdentityProvider } from '@/shared/providers/googleAuth';
import { LinkGoogleIdentityService } from './LinkGoogleIdentity.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const usersRepository = resolveUsersRepository();
const identitiesRepository = resolveIdentitiesRepository();
const googleIdentityProvider = resolveGoogleIdentityProvider();
const dateProvider = resolveDateProvider();
const transactionManager = resolveTransactionManager();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();

const linkGoogleIdentityService = new LinkGoogleIdentityService(
	usersRepository,
	identitiesRepository,
	googleIdentityProvider,
	dateProvider,
	transactionManager,
	sessionVersionMarkerStore,
);

export const resolveLinkGoogleIdentityService = () => linkGoogleIdentityService;
