import { SigninService } from './Signin.service';
import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveHashProvider } from '@/shared/providers/cryptography';

const hashProvider = resolveHashProvider();
const usersRepository = resolveUsersRepository();

const signinService = new SigninService(usersRepository, hashProvider);
export const resolveSigninService = () => signinService;
