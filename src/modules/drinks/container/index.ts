import { CategoriesRepository } from '@/modules/drinks/infra/mongo/repositories/Categories.repository';
import { DrinksRepository } from '@/modules/drinks/infra/mongo/repositories/Drinks.repository';
import { IngredientsRepository } from '@/modules/drinks/infra/mongo/repositories/Ingredients.repository';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { IDrinksRepository } from '@/modules/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/modules/drinks/repositories/IIngredients.repository';

// repositories
const categoriesRepository: ICategoriesRepository = new CategoriesRepository();
export const resolveCategoriesRepository = () => categoriesRepository;

const drinksRepository: IDrinksRepository = new DrinksRepository();
export const resolveDrinksRepository = () => drinksRepository;

const ingredientsRepository: IIngredientsRepository = new IngredientsRepository();
export const resolveIngredientsRepository = () => ingredientsRepository;
