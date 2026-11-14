import {
	resolveCategoriesRepository,
	resolveDrinksRepository,
	resolveIngredientsRepository,
	resolveUnitsRepository,
} from '@/core/drinks/infra/mongo/container';
import { ClearCreatorByUserService } from './ClearCreatorByUser.service';

const drinksRepository = resolveDrinksRepository();
const ingredientsRepository = resolveIngredientsRepository();
const categoriesRepository = resolveCategoriesRepository();
const unitsRepository = resolveUnitsRepository();

const clearCreatorByUserService = new ClearCreatorByUserService(
	drinksRepository,
	ingredientsRepository,
	categoriesRepository,
	unitsRepository,
);

export const resolveClearCreatorByUserService = () => clearCreatorByUserService;
