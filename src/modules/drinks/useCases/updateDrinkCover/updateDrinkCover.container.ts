import { resolveDrinksRepository } from '@modules/drinks/container';
import { UpdateDrinkCoverService } from './UpdateDrinkCover.service';
import { resolveStorageProvider } from '@shared/container/providers/storage';

const storageProvider = resolveStorageProvider();
const drinksRepository = resolveDrinksRepository();

const updateDrinkCoverService = new UpdateDrinkCoverService(drinksRepository, storageProvider);
export const resolveUpdateDrinkCoverService = () => updateDrinkCoverService;
