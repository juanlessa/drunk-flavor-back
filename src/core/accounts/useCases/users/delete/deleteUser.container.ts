import { resolveUsersRepository, resolveTokensRepository } from '@/core/accounts/infra/mongo/container';
import { DeleteUserService } from './DeleteUser.service';

const usersRepository = resolveUsersRepository();
const tokensRepository = resolveTokensRepository();

const deleteUserService = new DeleteUserService(usersRepository, tokensRepository);
export const resolveDeleteUserService = () => deleteUserService;
