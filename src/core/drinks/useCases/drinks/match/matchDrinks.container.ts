import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { MatchDrinksService } from './MatchDrinks.service';

const drinksRepository = resolveDrinksRepository();
const storageProvider = resolveStorageProvider();

const matchDrinksService = new MatchDrinksService(drinksRepository, storageProvider);

export const resolveMatchDrinksService = () => matchDrinksService;
