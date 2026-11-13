import {
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { UnlinkGoogleIdentityService } from './UnlinkGoogleIdentity.service';

const usersRepository = resolveUsersRepository();
const identitiesRepository = resolveIdentitiesRepository();
const credentialsRepository = resolveCredentialsRepository();
const transactionManager = resolveTransactionManager();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();

const unlinkGoogleIdentityService = new UnlinkGoogleIdentityService(
	usersRepository,
	identitiesRepository,
	credentialsRepository,
	transactionManager,
	sessionVersionMarkerStore,
);

export const resolveUnlinkGoogleIdentityService = () => unlinkGoogleIdentityService;
