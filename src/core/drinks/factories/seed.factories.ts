import { createDrinkFactory, createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { FACTORY_CREATOR_ID } from './authorship.factories';

type CatalogRepositories = {
	categoriesRepository: ICategoriesRepository;
	unitsRepository: IUnitsRepository;
	ingredientsRepository: IIngredientsRepository;
};

/** Stores a category and a unit, both created by `createdBy`. */
export const seedCategoryAndUnit = async (
	{ categoriesRepository, unitsRepository }: Pick<CatalogRepositories, 'categoriesRepository' | 'unitsRepository'>,
	createdBy: string = FACTORY_CREATOR_ID,
) => {
	const category = await categoriesRepository.create({ ...createCategoryFactory(), createdBy });
	const unit = await unitsRepository.create({ ...createUnitFactory(), createdBy });
	return { category, unit };
};

/** Stores a category, a unit and an ingredient that uses them, all created by `createdBy`. */
export const seedIngredient = async (repositories: CatalogRepositories, createdBy: string = FACTORY_CREATOR_ID) => {
	const { category, unit } = await seedCategoryAndUnit(repositories, createdBy);
	const { ingredientsRepository } = repositories;
	const { translations } = createIngredientFactory();
	const ingredient = await ingredientsRepository.create({ translations, category, units: [unit], createdBy });
	return { category, unit, ingredient };
};

/** Stores a drink made with a new ingredient, everything created by `createdBy`. */
export const seedDrink = async (
	repositories: CatalogRepositories & { drinksRepository: IDrinksRepository },
	createdBy: string = FACTORY_CREATOR_ID,
) => {
	const { ingredient, unit, category } = await seedIngredient(repositories, createdBy);
	const { translations } = createDrinkFactory();
	const drink = await repositories.drinksRepository.create({
		translations,
		ingredients: [createDrinkIngredientFactory(ingredient)],
		createdBy,
	});
	return { drink, ingredient, unit, category };
};
