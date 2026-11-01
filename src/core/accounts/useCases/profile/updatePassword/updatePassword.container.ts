import { resolveUsersRepository, resolveCredentialsRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveHashProvider } from '@/shared/providers/cryptography';
import { UpdatePasswordService } from './updatePassword.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const updatePasswordService = new UpdatePasswordService(
	resolveUsersRepository(),
	resolveCredentialsRepository(),
	resolveHashProvider(),
	resolveTransactionManager(),
	resolveSessionVersionMarkerStore(),
);
export const resolveUpdatePasswordService = () => updatePasswordService;
