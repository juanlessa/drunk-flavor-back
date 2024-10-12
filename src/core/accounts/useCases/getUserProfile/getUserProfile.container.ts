import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { GetUserProfileService } from './GetUserProfile.service';

const usersRepository = resolveUsersRepository();

const getUserProfileService = new GetUserProfileService(usersRepository);
export const resolveGetUserProfileService = () => getUserProfileService;
