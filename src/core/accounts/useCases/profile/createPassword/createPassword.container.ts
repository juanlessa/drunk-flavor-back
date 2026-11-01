import { resolveCredentialsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveHashProvider } from '@/shared/providers/cryptography';
import { CreatePasswordService } from './CreatePassword.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const service = new CreatePasswordService(
	resolveUsersRepository(),
	resolveCredentialsRepository(),
	resolveHashProvider(),
	resolveTransactionManager(),
	resolveSessionVersionMarkerStore(),
);

export const resolveCreatePasswordService = () => service;
