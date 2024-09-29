import { resolveDrinksRepository } from '@/core/drinks/container';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { UpdateDrinkThumbnailService } from './UpdateDrinkThumbnail.service';

const drinksRepository = resolveDrinksRepository();
const storageProvider = resolveStorageProvider();

const updateDrinkThumbnailService = new UpdateDrinkThumbnailService(drinksRepository, storageProvider);
export const resolveUpdateDrinkThumbnailService = () => updateDrinkThumbnailService;
