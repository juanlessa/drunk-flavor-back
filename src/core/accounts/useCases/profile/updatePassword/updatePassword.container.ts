import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveHashProvider } from '@/shared/providers/cryptography';
import { UpdatePasswordService } from './updatePassword.service';

const hashProvider = resolveHashProvider();
const usersRepository = resolveUsersRepository();

const updatePasswordService = new UpdatePasswordService(usersRepository, hashProvider);
export const resolveUpdatePasswordService = () => updatePasswordService;
