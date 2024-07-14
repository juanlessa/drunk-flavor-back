import { resolveUsersRepository } from '@/core/accounts/container';
import { resolveEncryptionProvider } from '@/shared/providers/encryption';
import { CreateUserService } from '@/core/accounts/useCases/createUser/CreateUser.service';

const encryptionProvider = resolveEncryptionProvider();
const usersRepository = resolveUsersRepository();

const createUserService = new CreateUserService(usersRepository, encryptionProvider);
export const resolveCreateUserService = () => createUserService;
