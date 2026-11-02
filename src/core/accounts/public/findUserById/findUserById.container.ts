import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { FindUserByIdService } from './FindUserById.service';

const findUserByIdService = new FindUserByIdService(resolveUsersRepository());
export const resolveFindUserByIdService = () => findUserByIdService;
