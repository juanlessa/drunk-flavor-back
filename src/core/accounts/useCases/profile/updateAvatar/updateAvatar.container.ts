import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { UpdateAvatarService } from './UpdateAvatar.service';

const service = new UpdateAvatarService(resolveUsersRepository(), resolveStorageProvider());

export const resolveUpdateAvatarService = () => service;
