import { resolveUsersRepository } from '@/core/accounts/container';
import { resolveEncryptionProvider } from '@/shared/providers/encryption';
import { UpdateUserProfileService } from './UpdateUserProfile.service';

const encryptionProvider = resolveEncryptionProvider();
const usersRepository = resolveUsersRepository();

const updateUserProfileService = new UpdateUserProfileService(usersRepository, encryptionProvider);
export const resolveUpdateUserProfileService = () => updateUserProfileService;
