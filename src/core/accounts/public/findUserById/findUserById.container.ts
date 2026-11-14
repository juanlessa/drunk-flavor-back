import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { FindUserByIdService } from './FindUserById.service';

const usersRepository = resolveUsersRepository();

const findUserByIdService = new FindUserByIdService(usersRepository);

export const resolveFindUserByIdService = () => findUserByIdService;
