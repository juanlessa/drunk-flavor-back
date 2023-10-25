import AppError from '@errors/AppError';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateDrinkThumbnailService } from './UpdateDrinkThumbnail.service';
import { DRINK_ERRORS } from '@modules/drinks/errors/drink.errors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { ITranslations } from '@modules/drinks/types/translations';
import { IDrinkTranslation } from '@modules/drinks/entities/drink.entity';
import { IIngredient, IIngredientTranslation } from '@modules/drinks/entities/ingredient.entity';
import { ICategory, ICategoryTranslation } from '@modules/drinks/entities/category.entity';
import { IStorageProvider } from '@shared/container/providers/storage/IStorage.provider';
import { LocalStorageProvider } from '@shared/container/providers/storage/implementations/LocalStorage.provider';

let storageProvider: IStorageProvider;
let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let updateDrinkThumbnailService: UpdateDrinkThumbnailService;

// test constants
const translations: ITranslations<IDrinkTranslation> = {
	en: { name: 'en name', method: 'en method...' },
	pt: { name: 'pt name', method: 'pt method...' }
};
const thumbnailFileName = 'fale-name-test.jpeg';

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

describe('Update Drink Thumbnail', () => {
	beforeEach(async () => {
		storageProvider = new LocalStorageProvider();
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory();
		updateDrinkThumbnailService = new UpdateDrinkThumbnailService(drinksRepositoryInMemory, storageProvider);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
		createdIngredient = await ingredientsRepositoryInMemory.create({
			translations: ingredientTranslations,
			category: createdCategory,
			is_alcoholic: ingredientIsAlcoholic
		});
	});

	it('should be able to update a drink thumbnail', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			translations,
			ingredients: [{ ingredient: createdIngredient, quantity: 60 }]
		});

		await updateDrinkThumbnailService.execute({
			drink_id: createdDrink._id,
			thumbnail_file: thumbnailFileName
		});

		const updatedDrink = await drinksRepositoryInMemory.findById(createdDrink._id);

		expect(updatedDrink.thumbnail).toEqual(thumbnailFileName);
		expect(updatedDrink._id).toEqual(createdDrink._id);
	});

	it('should not be able to update the thumbnail of a nonexistent drink', async () => {
		const nonexistentDrinkId = new ObjectId().toString();

		await expect(
			updateDrinkThumbnailService.execute({
				drink_id: nonexistentDrinkId,
				thumbnail_file: thumbnailFileName
			})
		).rejects.toEqual(new AppError(DRINK_ERRORS.not_exist));
	});
});
