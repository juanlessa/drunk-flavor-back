import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { UpdateUserRoleService } from './UpdateUserRole.service';

const usersRepository = resolveUsersRepository();

const updateUserRoleService = new UpdateUserRoleService(usersRepository);
export const resolveUpdateUserRoleService = () => updateUserRoleService;
