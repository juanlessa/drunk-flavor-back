import { resolveAdministrativeEventsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { SuspendUserService } from './SuspendUser.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const usersRepository = resolveUsersRepository();
const transactionManager = resolveTransactionManager();
const administrativeEventsRepository = resolveAdministrativeEventsRepository();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();

const suspendUserService = new SuspendUserService(
	usersRepository,
	transactionManager,
	administrativeEventsRepository,
	sessionVersionMarkerStore,
);

export const resolveSuspendUserService = () => suspendUserService;
