import { UsersRepository } from '@modules/accounts/infra/mongo/repositories/Users.repository';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { UsersTokensRepository } from '@modules/accounts/infra/mongo/repositories/UsersTokens.repository';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokens.repository';

// repositories
const usersRepository: IUsersRepository = new UsersRepository();
export const resolveUsersRepository = () => usersRepository;

const usersTokensRepository: IUsersTokensRepository = new UsersTokensRepository();
export const resolveUsersTokensRepository = () => usersTokensRepository;
