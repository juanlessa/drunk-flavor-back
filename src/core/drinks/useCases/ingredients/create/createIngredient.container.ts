import { resolveCategoriesRepository, resolveIngredientsRepository } from '@/core/drinks/container';
import { CreateIngredientService } from './CreateIngredient.service';

const categoriesRepository = resolveCategoriesRepository();
const ingredientsRepository = resolveIngredientsRepository();

const createIngredientService = new CreateIngredientService(ingredientsRepository, categoriesRepository);
export const resolveCreateIngredientService = () => createIngredientService;
