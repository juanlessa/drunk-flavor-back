import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { UpdateProfileService } from './UpdateProfile.service';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';

const usersRepository = resolveUsersRepository();
const transactionManager = resolveTransactionManager();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();

const updateProfileService = new UpdateProfileService(usersRepository, transactionManager, sessionVersionMarkerStore);

export const resolveUpdateProfileService = () => updateProfileService;
