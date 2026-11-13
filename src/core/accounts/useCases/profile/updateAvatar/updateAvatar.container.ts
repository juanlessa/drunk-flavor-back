import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { UpdateAvatarService } from './UpdateAvatar.service';

const usersRepository = resolveUsersRepository();
const storageProvider = resolveStorageProvider();

const updateAvatarService = new UpdateAvatarService(usersRepository, storageProvider);

export const resolveUpdateAvatarService = () => updateAvatarService;
