import { resolveDrinksRepository } from '@/core/drinks/container';
import { ListDrinksService } from './ListDrinks.service';
import { resolveStorageProvider } from '@/shared/providers/storage';

const drinksRepository = resolveDrinksRepository();
const storageProvider = resolveStorageProvider();

const listDrinksService = new ListDrinksService(drinksRepository, storageProvider);
export const resolveListDrinksService = () => listDrinksService;
