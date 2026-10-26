import {
	resolveCategoriesRepository,
	resolveIngredientsRepository,
	resolveUnitsRepository,
} from '@/core/drinks/infra/mongo/container';
import { CreateIngredientService } from './CreateIngredient.service';

const categoriesRepository = resolveCategoriesRepository();
const ingredientsRepository = resolveIngredientsRepository();
const unitsRepository = resolveUnitsRepository();

const createIngredientService = new CreateIngredientService(
	ingredientsRepository,
	categoriesRepository,
	unitsRepository,
);
export const resolveCreateIngredientService = () => createIngredientService;
