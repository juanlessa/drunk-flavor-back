import { UsersRepository } from '@modules/accounts/infra/mongo/repositories/Users.repository';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';

// repositories
const usersRepository: IUsersRepository = new UsersRepository();
export const resolveUsersRepository = () => usersRepository;
