import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { ListDrinksService } from './ListDrinks.service';

const drinksRepository = resolveDrinksRepository();
const storageProvider = resolveStorageProvider();

const listDrinksService = new ListDrinksService(drinksRepository, storageProvider);

export const resolveListDrinksService = () => listDrinksService;
