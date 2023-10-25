import AppError from '@errors/AppError';
import { ICategory, ICategoryTranslation } from '@modules/drinks/entities/category.entity';
import { IIngredient, IIngredientTranslation } from '@modules/drinks/entities/ingredient.entity';
import { DRINK_ERRORS } from '@modules/drinks/errors/drink.errors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetDrinkService } from './GetDrink.service';
import { ITranslations } from '@modules/drinks/types/translations';
import { IDrinkTranslation } from '@modules/drinks/entities/drink.entity';
import { LocalStorageProvider } from '@shared/container/providers/storage/implementations/LocalStorage.provider';
import { IStorageProvider } from '@shared/container/providers/storage/IStorage.provider';

let storageProvider: IStorageProvider;
let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let getDrinkService: GetDrinkService;

// test constants
const translations: ITranslations<IDrinkTranslation> = {
	en: { name: 'en name', method: 'en method...' },
	pt: { name: 'pt name', method: 'pt method...' }
};

const ingredientTranslations: ITranslations<IIngredientTranslation> = {
	en: { name: 'en name', unit: 'ml', unit_plural: 'ml' },
	pt: { name: 'pt name', unit: 'ml', unit_plural: 'ml' }
};
const ingredientIsAlcoholic = true;
let createdIngredient: IIngredient;
const categoryTranslations: ITranslations<ICategoryTranslation> = {
	en: {
		name: 'category en name'
	},
	pt: { name: 'category pt name' }
};
let createdCategory: ICategory;

describe('Get Drink', () => {
	beforeEach(async () => {
		storageProvider = new LocalStorageProvider();
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory();
		getDrinkService = new GetDrinkService(drinksRepositoryInMemory, storageProvider);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
		createdIngredient = await ingredientsRepositoryInMemory.create({
			translations: ingredientTranslations,
			category: createdCategory,
			is_alcoholic: ingredientIsAlcoholic
		});
	});

	it('should be able to find a drink', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			translations,
			ingredients: [{ ingredient: createdIngredient, quantity: 60 }]
		});

		const findCreatedDrink = await getDrinkService.execute({ id: createdDrink._id });

		expect(findCreatedDrink._id).toEqual(createdDrink._id);
		expect(findCreatedDrink.translations).toEqual(translations);
	});

	it('should not be able to find a nonexistent drink', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(getDrinkService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError(DRINK_ERRORS.not_found)
		);
	});
});
