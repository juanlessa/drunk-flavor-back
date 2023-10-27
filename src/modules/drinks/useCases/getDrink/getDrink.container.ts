import { resolveDrinksRepository } from '@modules/drinks/container';
import { GetDrinkService } from './GetDrink.service';
import { resolveStorageProvider } from '@shared/container/providers/storage';

const storageProvider = resolveStorageProvider();
const drinksRepository = resolveDrinksRepository();

const getDrinkService = new GetDrinkService(drinksRepository, storageProvider);
export const resolveGetDrinkService = () => getDrinkService;
