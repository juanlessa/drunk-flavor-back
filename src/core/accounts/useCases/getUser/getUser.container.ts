import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { GetUserService } from './GetUser.service';

const usersRepository = resolveUsersRepository();

const getUserService = new GetUserService(usersRepository);
export const resolveGetUserService = () => getUserService;
