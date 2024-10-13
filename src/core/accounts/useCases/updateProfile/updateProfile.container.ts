import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { UpdateProfileService } from './UpdateProfile.service';

const usersRepository = resolveUsersRepository();

const updateProfileService = new UpdateProfileService(usersRepository);
export const resolveUpdateUpdateProfileService = () => updateProfileService;
