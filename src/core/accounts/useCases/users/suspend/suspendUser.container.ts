import { resolveAdministrativeEventsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { SuspendUserService } from './SuspendUser.service';

const suspendUserService = new SuspendUserService(
	resolveUsersRepository(),
	resolveTransactionManager(),
	resolveAdministrativeEventsRepository(),
);

export const resolveSuspendUserService = () => suspendUserService;
