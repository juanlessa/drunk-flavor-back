import { resolveIdentitiesRepository } from '@/core/accounts/infra/mongo/container';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveGoogleTokenVerifier } from '@/shared/providers/googleAuth';
import { ReauthenticateGoogleService } from './ReauthenticateGoogle.service';

const service = new ReauthenticateGoogleService(
	resolveGoogleTokenVerifier(),
	resolveIdentitiesRepository(),
	resolveDateProvider(),
);

export const resolveReauthenticateGoogleService = () => service;
