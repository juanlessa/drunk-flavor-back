import { resolveUsersRepository, resolveCredentialsRepository } from '@/core/accounts/infra/mongo/container';
import { resolveHashProvider } from '@/shared/providers/cryptography';
import { UpdatePasswordService } from './updatePassword.service';

const hashProvider = resolveHashProvider();
const usersRepository = resolveUsersRepository();
const credentialsRepository = resolveCredentialsRepository();

const updatePasswordService = new UpdatePasswordService(usersRepository, credentialsRepository, hashProvider);
export const resolveUpdatePasswordService = () => updatePasswordService;
