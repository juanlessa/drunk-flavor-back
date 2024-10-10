import { UsersRepository } from '@/core/accounts/infra/mongo/repositories/Users.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { DeepPartial } from '@/shared/types/utility.types';
import { CreateUser } from '../dtos/user.dtos';
import { IUsersTokensRepository } from '../repositories/IUsersTokens.repository';
import { UsersTokensRepository } from '../infra/mongo/repositories/UsersTokens.repository';

// repositories
const usersRepository: IUsersRepository = new UsersRepository();
export const resolveUsersRepository = () => usersRepository;

const usersTokensRepository: IUsersTokensRepository = new UsersTokensRepository();
export const resolveUsersTokensRepository = () => usersTokensRepository;

export const createUserFactory = (user?: DeepPartial<CreateUser>): CreateUser => ({
	name: user?.name || 'John',
	surname: user?.surname || 'Doe',
	email: user?.email || 'johndoe@example.com',
	password: user?.password || '12345678',
	role: user?.role || 'partner',
});
