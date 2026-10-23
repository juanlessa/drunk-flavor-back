import { CategoriesRepository } from '@/core/drinks/infra/mongo/repositories/Categories.repository';
import { DrinksRepository } from '@/core/drinks/infra/mongo/repositories/Drinks.repository';
import { IngredientsRepository } from '@/core/drinks/infra/mongo/repositories/Ingredients.repository';
import { UnitsRepository } from '@/core/drinks/infra/mongo/repositories/Units.repository';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';

const categoriesRepository: ICategoriesRepository = new CategoriesRepository();
export const resolveCategoriesRepository = () => categoriesRepository;

const drinksRepository: IDrinksRepository = new DrinksRepository();
export const resolveDrinksRepository = () => drinksRepository;

const ingredientsRepository: IIngredientsRepository = new IngredientsRepository();
export const resolveIngredientsRepository = () => ingredientsRepository;

const unitsRepository: IUnitsRepository = new UnitsRepository();
export const resolveUnitsRepository = () => unitsRepository;
