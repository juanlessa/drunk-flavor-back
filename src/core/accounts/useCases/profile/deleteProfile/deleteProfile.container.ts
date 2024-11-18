import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { DeleteProfileService } from './DeleteProfile.service';

const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();

const deleteProfileService = new DeleteProfileService(usersRepository, userTokensRepository);
export const resolveDeleteProfileService = () => deleteProfileService;
