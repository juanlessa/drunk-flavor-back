import { resolveDrinksRepository } from '@modules/drinks/container';
import { ListDrinksService } from '@modules/drinks/useCases/listDrinks/ListDrinks.service';
import { resolveStorageProvider } from '@shared/container/providers/storage';

const storageProvider = resolveStorageProvider();
const drinksRepository = resolveDrinksRepository();

const listDrinksService = new ListDrinksService(drinksRepository, storageProvider);
export const resolveListDrinksService = () => listDrinksService;
