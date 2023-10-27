import { resolveUsersRepository } from '@modules/accounts/container';
import { resolveEncryptionProvider } from '@shared/container/providers/encryption';
import { UpdateUserService } from '@modules/accounts/useCases/updateUser/UpdateUser.service';

const encryptionProvider = resolveEncryptionProvider();
const usersRepository = resolveUsersRepository();

const updateUserService = new UpdateUserService(usersRepository, encryptionProvider);
export const resolveUpdateUserService = () => updateUserService;
