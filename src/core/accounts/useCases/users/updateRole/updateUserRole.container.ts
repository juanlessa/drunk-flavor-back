import { resolveAdministrativeEventsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { UpdateUserRoleService } from './UpdateUserRole.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const usersRepository = resolveUsersRepository();
const transactionManager = resolveTransactionManager();
const administrativeEventsRepository = resolveAdministrativeEventsRepository();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();

const updateUserRoleService = new UpdateUserRoleService(
	usersRepository,
	transactionManager,
	administrativeEventsRepository,
	sessionVersionMarkerStore,
);

export const resolveUpdateUserRoleService = () => updateUserRoleService;
