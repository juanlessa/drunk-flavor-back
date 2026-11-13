import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { resolveCleanupQueueProvider } from '@/shared/providers/queue/cleanup';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { UpdateDrinkThumbnailService } from './UpdateDrinkThumbnail.service';

const drinksRepository = resolveDrinksRepository();
const storageProvider = resolveStorageProvider();
const cleanupQueueProvider = resolveCleanupQueueProvider();

const updateDrinkThumbnailService = new UpdateDrinkThumbnailService(
	drinksRepository,
	storageProvider,
	cleanupQueueProvider,
);

export const resolveUpdateDrinkThumbnailService = () => updateDrinkThumbnailService;
