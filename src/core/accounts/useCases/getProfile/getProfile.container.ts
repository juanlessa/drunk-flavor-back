import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { GetProfileService } from './GetProfile.service';

const usersRepository = resolveUsersRepository();

const getProfileService = new GetProfileService(usersRepository);
export const resolveGetProfileService = () => getProfileService;
