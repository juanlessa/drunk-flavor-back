import {
	resolveCategoriesRepository,
	resolveIngredientsRepository,
	resolveUnitsRepository,
} from '@/core/drinks/infra/mongo/container';
import { UpdateIngredientService } from './UpdateIngredient.service';

const categoriesRepository = resolveCategoriesRepository();
const ingredientsRepository = resolveIngredientsRepository();
const unitsRepository = resolveUnitsRepository();

const updateIngredientService = new UpdateIngredientService(
	ingredientsRepository,
	categoriesRepository,
	unitsRepository,
);
export const resolveUpdateIngredientService = () => updateIngredientService;
