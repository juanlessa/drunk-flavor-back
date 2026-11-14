import { resolveAdministrativeEventsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { ReactivateUserService } from './ReactivateUser.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const usersRepository = resolveUsersRepository();
const transactionManager = resolveTransactionManager();
const administrativeEventsRepository = resolveAdministrativeEventsRepository();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();

const reactivateUserService = new ReactivateUserService(
	usersRepository,
	transactionManager,
	administrativeEventsRepository,
	sessionVersionMarkerStore,
);

export const resolveReactivateUserService = () => reactivateUserService;
