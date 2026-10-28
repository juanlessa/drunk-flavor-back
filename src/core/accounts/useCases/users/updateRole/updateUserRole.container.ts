import { resolveAdministrativeEventsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { UpdateUserRoleService } from './UpdateUserRole.service';

const usersRepository = resolveUsersRepository();
const transactionManager = resolveTransactionManager();
const administrativeEventsRepository = resolveAdministrativeEventsRepository();

const updateUserRoleService = new UpdateUserRoleService(
	usersRepository,
	transactionManager,
	administrativeEventsRepository,
);
export const resolveUpdateUserRoleService = () => updateUserRoleService;
