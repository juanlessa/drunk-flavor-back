import { resolveDrinksRepository } from '@/core/drinks/container';
import { DeleteDrinkService } from './DeleteDrink.service';

const drinksRepository = resolveDrinksRepository();

const deleteDrinkService = new DeleteDrinkService(drinksRepository);
export const resolveDeleteDrinkService = () => deleteDrinkService;
