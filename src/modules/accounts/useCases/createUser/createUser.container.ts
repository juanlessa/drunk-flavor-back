import { resolveUsersRepository } from '@/modules/accounts/container';
import { resolveEncryptionProvider } from '@/shared/providers/encryption';
import { CreateUserService } from '@/modules/accounts/useCases/createUser/CreateUser.service';

const encryptionProvider = resolveEncryptionProvider();
const usersRepository = resolveUsersRepository();

const createUserService = new CreateUserService(usersRepository, encryptionProvider);
export const resolveCreateUserService = () => createUserService;
