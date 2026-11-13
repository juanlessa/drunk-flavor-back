import { SigninService } from './Signin.service';
import { resolveUsersRepository, resolveCredentialsRepository } from '@/core/accounts/infra/mongo/container';
import { resolveHashProvider } from '@/shared/providers/cryptography';

const usersRepository = resolveUsersRepository();
const credentialsRepository = resolveCredentialsRepository();
const hashProvider = resolveHashProvider();

const signinService = new SigninService(usersRepository, credentialsRepository, hashProvider);

export const resolveSigninService = () => signinService;
