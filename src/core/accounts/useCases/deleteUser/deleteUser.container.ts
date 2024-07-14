import { resolveUsersRepository } from '@/core/accounts/container';
import { DeleteUserService } from '@/core/accounts/useCases/deleteUser/DeleteUser.service';

const usersRepository = resolveUsersRepository();

const deleteUserService = new DeleteUserService(usersRepository);
export const resolveDeleteUserService = () => deleteUserService;
