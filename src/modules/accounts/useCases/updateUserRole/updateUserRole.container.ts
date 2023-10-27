import { resolveUsersRepository } from '@modules/accounts/container';
import { UpdateUserRoleService } from '@modules/accounts/useCases/updateUserRole/UpdateUserRole.service';

const usersRepository = resolveUsersRepository();

const updateUserRoleService = new UpdateUserRoleService(usersRepository);
export const resolveUpdateUserRoleService = () => updateUserRoleService;
