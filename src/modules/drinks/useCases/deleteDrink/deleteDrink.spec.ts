import { ICategory, ICategoryTranslation } from '@modules/drinks/entities/category.entity';
import { IIngredient, IIngredientTranslation } from '@modules/drinks/entities/ingredient.entity';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteDrinkService } from '@modules/drinks/useCases/deleteDrink/DeleteDrink.service';
import { ITranslations } from '@modules/drinks/types/translations';
import { IDrinkTranslation } from '@modules/drinks/entities/drink.entity';
import { IStorageProvider } from '@shared/container/providers/storage/IStorage.provider';
import { LocalStorageProvider } from '@shared/container/providers/storage/implementations/LocalStorage.provider';
import { BadRequestError } from '@shared/errors/error.lib';

let storageProvider: IStorageProvider;
let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let deleteDrinkService: DeleteDrinkService;

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

describe('Delete Drink', () => {
	beforeEach(async () => {
		storageProvider = new LocalStorageProvider();
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory();
		deleteDrinkService = new DeleteDrinkService(drinksRepositoryInMemory, storageProvider);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
		createdIngredient = await ingredientsRepositoryInMemory.create({
			translations: ingredientTranslations,
			category: createdCategory,
			is_alcoholic: ingredientIsAlcoholic
		});
	});
	it('should be able to delete a drink', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			translations,
			ingredients: [{ ingredient: createdIngredient, quantity: 60 }]
		});

		await deleteDrinkService.execute({ id: createdDrink._id });

		const findDeledDrink = await drinksRepositoryInMemory.findById(createdDrink._id);

		expect(findDeledDrink).toBeUndefined();
	});

	it('should not be able to delete a nonexistent drink', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(deleteDrinkService.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});
});
