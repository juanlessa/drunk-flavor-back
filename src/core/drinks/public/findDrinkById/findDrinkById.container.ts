import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { FindDrinkByIdService } from './FindDrinkById.service';

const findDrinkByIdService = new FindDrinkByIdService(resolveDrinksRepository());

export const resolveFindDrinkByIdService = () => findDrinkByIdService;
