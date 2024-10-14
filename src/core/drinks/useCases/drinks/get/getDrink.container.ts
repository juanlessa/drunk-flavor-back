import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { GetDrinkService } from './GetDrink.service';
import { resolveStorageProvider } from '@/shared/providers/storage';

const drinksRepository = resolveDrinksRepository();
const storageProvider = resolveStorageProvider();

const getDrinkService = new GetDrinkService(drinksRepository, storageProvider);
export const resolveGetDrinkService = () => getDrinkService;
