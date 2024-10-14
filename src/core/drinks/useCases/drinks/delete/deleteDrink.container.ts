import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { DeleteDrinkService } from './DeleteDrink.service';

const drinksRepository = resolveDrinksRepository();

const deleteDrinkService = new DeleteDrinkService(drinksRepository);
export const resolveDeleteDrinkService = () => deleteDrinkService;
