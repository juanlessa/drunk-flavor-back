import { AuthenticateUserService } from '@/core/accounts/useCases/authenticateUser/AuthenticateUser.service';
import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveHashProvider } from '@/shared/providers/cryptography';

const hashProvider = resolveHashProvider();
const usersRepository = resolveUsersRepository();

const authenticateUserService = new AuthenticateUserService(usersRepository, hashProvider);
export const resolveAuthenticateUserService = () => authenticateUserService;
