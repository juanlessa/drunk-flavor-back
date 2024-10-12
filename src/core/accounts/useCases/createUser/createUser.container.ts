import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { CreateUserService } from '@/core/accounts/useCases/createUser/CreateUser.service';
import { resolveHashProvider } from '@/shared/providers/cryptography';

const hashProvider = resolveHashProvider();
const usersRepository = resolveUsersRepository();

const createUserService = new CreateUserService(usersRepository, hashProvider);
export const resolveCreateUserService = () => createUserService;
