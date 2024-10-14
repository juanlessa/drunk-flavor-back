import { Category } from '@/core/drinks/entities/category.entity';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { ObjectId } from 'mongodb';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteDrinkService } from './DeleteDrink.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createDrinkFactory } from '@/core/drinks/factories/drink.factories';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';
import { Drink } from '@/core/drinks/entities/drink.entity';

let categoriesRepositoryInMemory: ICategoriesRepository;
let ingredientsRepositoryInMemory: IIngredientsRepository;
let drinksRepositoryInMemory: IDrinksRepository;
let storageProvider: IStorageProvider;
let service: DeleteDrinkService;

const { translations: categoryTranslations } = createCategoryFactory();
let createdCategory: Category;
const { translations: ingredientTranslations, is_alcoholic: ingredientIsAlcoholic } = createIngredientFactory();
let createdIngredient: Ingredient;
const { translations } = createDrinkFactory();

let createdDrink: Drink;

describe('Delete Drink', () => {
	beforeEach(async () => {
		vi.clearAllMocks();

		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory();
		storageProvider = new MockStorageProvider();
		service = new DeleteDrinkService(drinksRepositoryInMemory, storageProvider);

		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
		createdIngredient = await ingredientsRepositoryInMemory.create({
			translations: ingredientTranslations,
			is_alcoholic: ingredientIsAlcoholic,
			category: createdCategory,
		});
		createdDrink = await drinksRepositoryInMemory.create({
			translations,
			ingredients: [{ ingredient: createdIngredient, quantity: 60 }],
		});
	});

	afterAll(async () => {
		vi.clearAllMocks();
	});

	it('should be able to delete a drink', async () => {
		await service.execute({ id: createdDrink._id.toString() });

		const found = await drinksRepositoryInMemory.findById(createdDrink._id.toString());

		expect(found).toBeNull();
	});

	it('should not be able to delete a nonexistent drink', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should be able to delete the cover and thumbnail during delete a drink', async () => {
		await drinksRepositoryInMemory.update({
			id: createdDrink._id.toString(),
			cover: { name: 'coverFile.png', mimetype: 'image/png', url: '' },
			thumbnail: { name: 'thumbnailFile.jpeg', mimetype: 'image/jpeg', url: '' },
		});

		await service.execute({ id: createdDrink._id.toString() });

		const found = await drinksRepositoryInMemory.findById(createdDrink._id.toString());

		expect(storageProvider.deleteFile).toBeCalledTimes(2);
	});
});
