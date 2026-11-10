import {
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { UnlinkGoogleIdentityService } from './UnlinkGoogleIdentity.service';

const service = new UnlinkGoogleIdentityService(
	resolveUsersRepository(),
	resolveIdentitiesRepository(),
	resolveCredentialsRepository(),
	resolveTransactionManager(),
	resolveSessionVersionMarkerStore(),
);

export const resolveUnlinkGoogleIdentityService = () => service;
