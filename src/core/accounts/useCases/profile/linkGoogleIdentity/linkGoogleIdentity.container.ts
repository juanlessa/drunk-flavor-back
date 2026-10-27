import {
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveHashProvider } from '@/shared/providers/cryptography';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveGoogleTokenVerifier } from '@/shared/providers/googleAuth';
import { LinkGoogleIdentityService } from './LinkGoogleIdentity.service';

const service = new LinkGoogleIdentityService(
	resolveUsersRepository(),
	resolveCredentialsRepository(),
	resolveIdentitiesRepository(),
	resolveGoogleTokenVerifier(),
	resolveHashProvider(),
	resolveDateProvider(),
);

export const resolveLinkGoogleIdentityService = () => service;
