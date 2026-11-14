import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { GetDrinkService } from './GetDrink.service';

const drinksRepository = resolveDrinksRepository();
const storageProvider = resolveStorageProvider();

const getDrinkService = new GetDrinkService(drinksRepository, storageProvider);

export const resolveGetDrinkService = () => getDrinkService;
