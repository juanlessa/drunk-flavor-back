import { resolveIdentitiesRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveGoogleIdentityProvider } from '@/shared/providers/googleAuth';
import { ReauthenticateGoogleService } from './ReauthenticateGoogle.service';

const googleIdentityProvider = resolveGoogleIdentityProvider();
const usersRepository = resolveUsersRepository();
const identitiesRepository = resolveIdentitiesRepository();
const dateProvider = resolveDateProvider();

const reauthenticateGoogleService = new ReauthenticateGoogleService(
	googleIdentityProvider,
	usersRepository,
	identitiesRepository,
	dateProvider,
);

export const resolveReauthenticateGoogleService = () => reauthenticateGoogleService;
