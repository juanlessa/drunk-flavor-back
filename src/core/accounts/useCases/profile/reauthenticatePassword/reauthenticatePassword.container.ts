import { resolveCredentialsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveHashProvider } from '@/shared/providers/cryptography';
import { resolveDateProvider } from '@/shared/providers/date';
import { ReauthenticatePasswordService } from './ReauthenticatePassword.service';

const service = new ReauthenticatePasswordService(
	resolveUsersRepository(),
	resolveCredentialsRepository(),
	resolveHashProvider(),
	resolveDateProvider(),
);

export const resolveReauthenticatePasswordService = () => service;
