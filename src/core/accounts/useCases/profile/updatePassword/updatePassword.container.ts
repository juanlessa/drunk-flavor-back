import { resolveUsersRepository, resolveCredentialsRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveHashProvider } from '@/shared/providers/cryptography';
import { UpdatePasswordService } from './updatePassword.service';

const updatePasswordService = new UpdatePasswordService(
	resolveUsersRepository(),
	resolveCredentialsRepository(),
	resolveHashProvider(),
	resolveTransactionManager(),
);
export const resolveUpdatePasswordService = () => updatePasswordService;
