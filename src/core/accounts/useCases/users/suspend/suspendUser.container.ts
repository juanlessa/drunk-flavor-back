import { resolveAdministrativeEventsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { SuspendUserService } from './SuspendUser.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const suspendUserService = new SuspendUserService(
	resolveUsersRepository(),
	resolveTransactionManager(),
	resolveAdministrativeEventsRepository(),
	resolveSessionVersionMarkerStore(),
);

export const resolveSuspendUserService = () => suspendUserService;
