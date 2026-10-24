import { UsersRepository } from '@/core/accounts/infra/mongo/repositories/Users.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ITokensRepository } from '../../../repositories/ITokens.repository';
import { TokensRepository } from '../repositories/Tokens.repository';

const usersRepository: IUsersRepository = new UsersRepository();
export const resolveUsersRepository = () => usersRepository;

const tokensRepository: ITokensRepository = new TokensRepository();
export const resolveTokensRepository = () => tokensRepository;
