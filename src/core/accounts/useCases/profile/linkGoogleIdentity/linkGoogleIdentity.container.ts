import { resolveIdentitiesRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveGoogleTokenVerifier } from '@/shared/providers/googleAuth';
import { LinkGoogleIdentityService } from './LinkGoogleIdentity.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const service = new LinkGoogleIdentityService(
	resolveUsersRepository(),
	resolveIdentitiesRepository(),
	resolveGoogleTokenVerifier(),
	resolveDateProvider(),
	resolveTransactionManager(),
	resolveSessionVersionMarkerStore(),
);

export const resolveLinkGoogleIdentityService = () => service;
