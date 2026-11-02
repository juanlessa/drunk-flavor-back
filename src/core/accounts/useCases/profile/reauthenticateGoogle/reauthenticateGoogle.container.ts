import { resolveIdentitiesRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveGoogleIdentityProvider } from '@/shared/providers/googleAuth';
import { ReauthenticateGoogleService } from './ReauthenticateGoogle.service';

const service = new ReauthenticateGoogleService(
	resolveGoogleIdentityProvider(),
	resolveUsersRepository(),
	resolveIdentitiesRepository(),
	resolveDateProvider(),
);

export const resolveReauthenticateGoogleService = () => service;
