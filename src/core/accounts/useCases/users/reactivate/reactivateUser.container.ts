import { resolveAdministrativeEventsRepository, resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { ReactivateUserService } from './ReactivateUser.service';

const reactivateUserService = new ReactivateUserService(
	resolveUsersRepository(),
	resolveTransactionManager(),
	resolveAdministrativeEventsRepository(),
);

export const resolveReactivateUserService = () => reactivateUserService;
