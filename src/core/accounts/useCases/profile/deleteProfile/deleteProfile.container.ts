import { resolveUsersRepository, resolveTokensRepository } from '@/core/accounts/infra/mongo/container';
import { DeleteProfileService } from './DeleteProfile.service';

const usersRepository = resolveUsersRepository();
const tokensRepository = resolveTokensRepository();

const deleteProfileService = new DeleteProfileService(usersRepository, tokensRepository);
export const resolveDeleteProfileService = () => deleteProfileService;
