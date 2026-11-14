import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveCleanupQueueProvider } from '@/shared/providers/queue/cleanup';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { UpdateAvatarService } from './UpdateAvatar.service';

const usersRepository = resolveUsersRepository();
const storageProvider = resolveStorageProvider();
const cleanupQueueProvider = resolveCleanupQueueProvider();

const updateAvatarService = new UpdateAvatarService(usersRepository, storageProvider, cleanupQueueProvider);

export const resolveUpdateAvatarService = () => updateAvatarService;
