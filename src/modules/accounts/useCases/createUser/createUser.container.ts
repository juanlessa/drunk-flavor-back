import { resolveUsersRepository } from '@modules/accounts/container';
import { resolveEncryptionProvider } from '@shared/container/providers/encryption';
import { CreateUserService } from './CreateUser.service';

const encryptionProvider = resolveEncryptionProvider();
const usersRepository = resolveUsersRepository();

const createUserService = new CreateUserService(usersRepository, encryptionProvider);
export const resolveCreateUserService = () => createUserService;
