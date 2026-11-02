import { resolveAdministrativeEventsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { ReactivateUserService } from './ReactivateUser.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const reactivateUserService = new ReactivateUserService(
	resolveUsersRepository(),
	resolveTransactionManager(),
	resolveAdministrativeEventsRepository(),
	resolveSessionVersionMarkerStore(),
);

export const resolveReactivateUserService = () => reactivateUserService;
