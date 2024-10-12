import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { UpdateUserProfileService } from './UpdateUserProfile.service';
import { resolveHashProvider } from '@/shared/providers/cryptography';

const hashProvider = resolveHashProvider();
const usersRepository = resolveUsersRepository();

const updateUserProfileService = new UpdateUserProfileService(usersRepository, hashProvider);
export const resolveUpdateUserProfileService = () => updateUserProfileService;
