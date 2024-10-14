import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { ListUsersService } from '@/core/accounts/useCases/listUsers/ListUsers.service';

const usersRepository = resolveUsersRepository();

const listUsersService = new ListUsersService(usersRepository);
export const resolveListUsersService = () => listUsersService;
