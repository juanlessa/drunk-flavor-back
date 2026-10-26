import { SigninService } from './Signin.service';
import { resolveUsersRepository, resolveCredentialsRepository } from '@/core/accounts/infra/mongo/container';
import { resolveHashProvider } from '@/shared/providers/cryptography';

const hashProvider = resolveHashProvider();
const usersRepository = resolveUsersRepository();
const credentialsRepository = resolveCredentialsRepository();

const signinService = new SigninService(usersRepository, credentialsRepository, hashProvider);
export const resolveSigninService = () => signinService;
