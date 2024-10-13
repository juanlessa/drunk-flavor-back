import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { DeleteUserService } from '@/core/accounts/useCases/deleteUser/DeleteUser.service';

const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();

const deleteUserService = new DeleteUserService(usersRepository, userTokensRepository);
export const resolveDeleteUserService = () => deleteUserService;
