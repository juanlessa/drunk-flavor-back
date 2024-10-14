import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { UpdateDrinkCoverService } from './UpdateDrinkCover.service';

const drinksRepository = resolveDrinksRepository();
const storageProvider = resolveStorageProvider();

const updateDrinkCoverService = new UpdateDrinkCoverService(drinksRepository, storageProvider);
export const resolveUpdateDrinkCoverService = () => updateDrinkCoverService;
