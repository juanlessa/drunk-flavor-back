import { resolveUsersRepository } from '@modules/accounts/container';
import { ListUsersService } from './ListUsers.service';

const usersRepository = resolveUsersRepository();

const listUsersService = new ListUsersService(usersRepository);
export const resolveListUsersService = () => listUsersService;
