import { resolveCredentialsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveHashProvider } from '@/shared/providers/cryptography';
import { CreatePasswordService } from './CreatePassword.service';

const service = new CreatePasswordService(
	resolveUsersRepository(),
	resolveCredentialsRepository(),
	resolveHashProvider(),
);

export const resolveCreatePasswordService = () => service;
