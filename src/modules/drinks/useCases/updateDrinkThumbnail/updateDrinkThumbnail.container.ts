import { resolveDrinksRepository } from '@modules/drinks/container';
import { UpdateDrinkThumbnailService } from './UpdateDrinkThumbnail.service';
import { resolveStorageProvider } from '@shared/container/providers/storage';

const storageProvider = resolveStorageProvider();
const drinksRepository = resolveDrinksRepository();

const updateDrinkThumbnailService = new UpdateDrinkThumbnailService(drinksRepository, storageProvider);
export const resolveUpdateDrinkThumbnailService = () => updateDrinkThumbnailService;
