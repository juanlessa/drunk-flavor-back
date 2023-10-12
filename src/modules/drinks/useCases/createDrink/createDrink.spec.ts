import AppError from '@errors/AppError';
import { DRINK_ERRORS } from '@modules/drinks/errors/drink.errors';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateDrinkService } from './CreateDrink.service';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { ICategory, ICategoryTranslation } from '@modules/drinks/entities/category.entity';
import { IIngredient, IIngredientTranslation } from '@modules/drinks/entities/ingredient.entity';
import { ITranslations } from '@modules/drinks/types/translations';
import { IDrinkTranslation } from '@modules/drinks/entities/drink.entity';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let createDrinkService: CreateDrinkService;

// test constants
const translations: ITranslations<IDrinkTranslation> = {
	en: { name: 'en name', method: 'en method...' },
	pt: { name: 'pt name', method: 'pt method...' }
};

const translationsSameName: ITranslations<IDrinkTranslation> = {
	en: { name: 'en name', method: 'en method...' },
	pt: { name: 'pt different name', method: 'pt method...' }
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

describe('Create Drink', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory();
		createDrinkService = new CreateDrinkService(drinksRepositoryInMemory, ingredientsRepositoryInMemory);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
		createdIngredient = await ingredientsRepositoryInMemory.create({
			translations: ingredientTranslations,
			category: createdCategory,
			is_alcoholic: ingredientIsAlcoholic
		});
	});

	it('should be able to create a new drink', async () => {
		await createDrinkService.execute({
			translations,
			ingredients: [{ ingredient_id: createdIngredient._id, quantity: 60 }]
		});

		const createdDrink = await drinksRepositoryInMemory.findByName(translations);

		expect(createdDrink).toHaveProperty('_id');
		expect(createdDrink.translations).toEqual(translations);
		expect(createdDrink.ingredients.length).toEqual(1);
	});

	it('should not be able to create a drink with an existing name', async () => {
		await drinksRepositoryInMemory.create({
			translations,
			ingredients: [{ ingredient: createdIngredient, quantity: 60 }]
		});

		await expect(
			createDrinkService.execute({
				translations: translationsSameName,
				ingredients: [{ ingredient_id: createdIngredient._id, quantity: 60 }]
			})
		).rejects.toEqual(new AppError(DRINK_ERRORS.already_exist));
	});

	it('should not be able to create a drink with a nonexistent ingredient', async () => {
		await expect(
			createDrinkService.execute({
				translations,
				ingredients: [{ ingredient_id: new ObjectId().toString(), quantity: 60 }]
			})
		).rejects.toEqual(new AppError(DRINK_ERRORS.some_ingredients_not_exist));
	});
});
