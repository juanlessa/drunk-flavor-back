import { UsersRepository } from '@/core/accounts/infra/mongo/repositories/Users.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IUserTokensRepository } from '../../../repositories/IUserTokens.repository';
import { UserTokensRepository } from '../repositories/UserTokens.repository';

const usersRepository: IUsersRepository = new UsersRepository();
export const resolveUsersRepository = () => usersRepository;

const userTokensRepository: IUserTokensRepository = new UserTokensRepository();
export const resolveUsersTokensRepository = () => userTokensRepository;
