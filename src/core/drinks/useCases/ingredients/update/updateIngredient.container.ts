import {
	resolveCategoriesRepository,
	resolveIngredientsRepository,
	resolveUnitsRepository,
} from '@/core/drinks/infra/mongo/container';
import { UpdateIngredientService } from './UpdateIngredient.service';

const ingredientsRepository = resolveIngredientsRepository();
const categoriesRepository = resolveCategoriesRepository();
const unitsRepository = resolveUnitsRepository();

const updateIngredientService = new UpdateIngredientService(
	ingredientsRepository,
	categoriesRepository,
	unitsRepository,
);

export const resolveUpdateIngredientService = () => updateIngredientService;
