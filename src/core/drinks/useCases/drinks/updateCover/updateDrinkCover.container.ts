import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { resolveCleanupQueueProvider } from '@/shared/providers/queue/cleanup';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { UpdateDrinkCoverService } from './UpdateDrinkCover.service';

const drinksRepository = resolveDrinksRepository();
const storageProvider = resolveStorageProvider();
const cleanupQueueProvider = resolveCleanupQueueProvider();

const updateDrinkCoverService = new UpdateDrinkCoverService(drinksRepository, storageProvider, cleanupQueueProvider);

export const resolveUpdateDrinkCoverService = () => updateDrinkCoverService;
