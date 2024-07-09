import { UsersRepository } from '@/modules/accounts/infra/mongo/repositories/Users.repository';
import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';
import { DeepPartial } from '@/shared/types/utility.types';
import { CreateUser } from '../dtos/user.dtos';

// repositories
const usersRepository: IUsersRepository = new UsersRepository();
export const resolveUsersRepository = () => usersRepository;

export const createUserFactory = (user?: DeepPartial<CreateUser>): CreateUser => ({
	name: user?.name || 'John',
	surname: user?.surname || 'Doe',
	email: user?.email || 'johndoe@example.com',
	password: user?.password || '12345678',
	role: user?.role || 'partner',
});
