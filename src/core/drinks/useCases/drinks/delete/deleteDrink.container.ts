import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { DeleteDrinkService } from './DeleteDrink.service';

const drinksRepository = resolveDrinksRepository();
const storageProvider = resolveStorageProvider();

const deleteDrinkService = new DeleteDrinkService(drinksRepository, storageProvider);
export const resolveDeleteDrinkService = () => deleteDrinkService;
