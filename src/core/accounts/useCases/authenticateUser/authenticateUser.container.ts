import { AuthenticateUserService } from '@/core/accounts/useCases/authenticateUser/AuthenticateUser.service';
import { resolveEncryptionProvider } from '@/shared/providers/encryption';
import { resolveUsersRepository } from '@/core/accounts/container';

const encryptionProvider = resolveEncryptionProvider();
const usersRepository = resolveUsersRepository();

const authenticateUserService = new AuthenticateUserService(usersRepository, encryptionProvider);
export const resolveAuthenticateUserService = () => authenticateUserService;
