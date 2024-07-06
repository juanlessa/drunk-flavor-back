import { resolveUsersRepository } from '@/modules/accounts/container';
import { GetUserProfileService } from './GetUserProfile.service';

const usersRepository = resolveUsersRepository();

const getUserProfileService = new GetUserProfileService(usersRepository);
export const resolveGetUserProfileService = () => getUserProfileService;
