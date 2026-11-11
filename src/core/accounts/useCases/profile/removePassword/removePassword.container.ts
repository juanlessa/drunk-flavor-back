import {
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { RemovePasswordService } from './RemovePassword.service';

const service = new RemovePasswordService(
	resolveUsersRepository(),
	resolveIdentitiesRepository(),
	resolveCredentialsRepository(),
	resolveTransactionManager(),
	resolveSessionVersionMarkerStore(),
);

export const resolveRemovePasswordService = () => service;
