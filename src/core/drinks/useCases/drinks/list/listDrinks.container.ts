import { resolveDrinksRepository } from '@/core/drinks/container';
import { ListDrinksService } from './ListDrinks.service';

const drinksRepository = resolveDrinksRepository();

const listDrinksService = new ListDrinksService(drinksRepository);
export const resolveListDrinksService = () => listDrinksService;
