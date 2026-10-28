import { resolveCredentialsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveHashProvider } from '@/shared/providers/cryptography';
import { CreatePasswordService } from './CreatePassword.service';

const service = new CreatePasswordService(
	resolveUsersRepository(),
	resolveCredentialsRepository(),
	resolveHashProvider(),
	resolveTransactionManager(),
);

export const resolveCreatePasswordService = () => service;
