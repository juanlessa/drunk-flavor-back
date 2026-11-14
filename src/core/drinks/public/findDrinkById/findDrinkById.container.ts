import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { FindDrinkByIdService } from './FindDrinkById.service';

const drinksRepository = resolveDrinksRepository();

const findDrinkByIdService = new FindDrinkByIdService(drinksRepository);

export const resolveFindDrinkByIdService = () => findDrinkByIdService;
