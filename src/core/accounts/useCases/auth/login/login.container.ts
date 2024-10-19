import { LoginService } from './Login.service';
import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveHashProvider } from '@/shared/providers/cryptography';

const hashProvider = resolveHashProvider();
const usersRepository = resolveUsersRepository();

const loginService = new LoginService(usersRepository, hashProvider);
export const resolveLoginServiceService = () => loginService;
