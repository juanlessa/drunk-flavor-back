import { resolveUsersRepository } from '@/core/accounts/container';
import { UpdateUserRoleService } from './UpdateUserRole.service';

const usersRepository = resolveUsersRepository();

const updateUserRoleService = new UpdateUserRoleService(usersRepository);
export const resolveUpdateUserRoleService = () => updateUserRoleService;
