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
import { UpdateDrinkCoverService } from './UpdateDrinkCover.service';
import { IDrinkTranslation } from '@modules/drinks/entities/drink.entity';
import { ITranslations } from '@modules/drinks/types/translations';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let updateDrinkCoverService: UpdateDrinkCoverService;

// test constants
const translations: ITranslations<IDrinkTranslation> = {
	en: { name: 'en name', method: 'en method...' },
	pt: { name: 'pt name', method: 'pt method...' }
};
const coverFileName = 'fale-name-test.jpeg';

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

describe('Update Drink Cover', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory();
		updateDrinkCoverService = new UpdateDrinkCoverService(drinksRepositoryInMemory);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
		createdIngredient = await ingredientsRepositoryInMemory.create({
			translations: ingredientTranslations,
			category: createdCategory,
			is_alcoholic: ingredientIsAlcoholic
		});
	});

	it('should be able to update a drink cover', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			translations,
			ingredients: [{ ingredient: createdIngredient, quantity: 60 }]
		});

		await updateDrinkCoverService.execute({
			drink_id: createdDrink._id,
			cover_file: coverFileName
		});

		const updatedDrink = await drinksRepositoryInMemory.findById(createdDrink._id);

		expect(updatedDrink.cover).toEqual(coverFileName);
		expect(updatedDrink._id).toEqual(createdDrink._id);
	});

	it('should not be able to update the cover of a nonexistent drink', async () => {
		const nonexistentDrinkId = new ObjectId().toString();

		await expect(
			updateDrinkCoverService.execute({
				drink_id: nonexistentDrinkId,
				cover_file: coverFileName
			})
		).rejects.toEqual(new AppError(DRINK_ERRORS.not_exist));
	});
});
