import { resolveCategoriesRepository, resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { UpdateIngredientService } from './UpdateIngredient.service';

const categoriesRepository = resolveCategoriesRepository();
const ingredientsRepository = resolveIngredientsRepository();

const updateIngredientService = new UpdateIngredientService(ingredientsRepository, categoriesRepository);
export const resolveUpdateIngredientService = () => updateIngredientService;
