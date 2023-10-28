import { resolveDrinksRepository } from '@modules/drinks/container';
import { DeleteDrinkService } from '@modules/drinks/useCases/deleteDrink/DeleteDrink.service';
import { resolveStorageProvider } from '@shared/container/providers/storage';

const storageProvider = resolveStorageProvider();
const drinksRepository = resolveDrinksRepository();

const deleteDrinkService = new DeleteDrinkService(drinksRepository, storageProvider);
export const resolveDeleteDrinkService = () => deleteDrinkService;
