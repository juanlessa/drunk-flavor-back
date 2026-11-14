import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { FindDrinksByIdsService } from './FindDrinksByIds.service';

const drinksRepository = resolveDrinksRepository();
const findDrinksByIdsService = new FindDrinksByIdsService(drinksRepository);

export const resolveFindDrinksByIdsService = () => findDrinksByIdsService;
