import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { ObjectId } from 'mongodb';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { createCategoryFactory, createDrinkFactory, createIngredientFactory } from '@/core/drinks/container';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { UpdateDrinkThumbnailService } from './UpdateDrinkThumbnail.service';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';
import { Readable } from 'node:stream';
import { hasFileExtension } from '@/shared/helpers/file.helpers';
import { FileMetadata } from '@/shared/types/file.types';

let categoriesRepositoryInMemory: ICategoriesRepository;
let ingredientsRepositoryInMemory: IIngredientsRepository;
let drinksRepositoryInMemory: IDrinksRepository;
let storageProvider: IStorageProvider;
let service: UpdateDrinkThumbnailService;

const { translations: categoryTranslations } = createCategoryFactory();
const { translations: translationsIngredient } = createIngredientFactory();

const { translations } = createDrinkFactory();

const fileName = 'imageTestingFile.png';
const fileMimetype = 'image/png';

const mockedFileStream = Object.assign(
	new Readable({
		read(_size) {
			this.push(null);
		},
	}),
	{ truncated: false, bytesRead: 1234, pipe: vi.fn(), on: vi.fn() },
);

let ingredient: Ingredient;
let createdDrink: Drink;

describe('Update Drink', () => {
	beforeEach(async () => {
		vi.clearAllMocks();

		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory();
		storageProvider = new MockStorageProvider();
		service = new UpdateDrinkThumbnailService(drinksRepositoryInMemory, storageProvider);

		const category = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
		ingredient = await ingredientsRepositoryInMemory.create({
			translations: translationsIngredient,
			is_alcoholic: false,
			category: category,
		});
		createdDrink = await drinksRepositoryInMemory.create({
			translations,
			ingredients: [{ quantity: 30, ingredient }],
		});
	});

	afterAll(async () => {
		vi.clearAllMocks();
	});

	it('should be able to update a drink thumbnail', async () => {
		await service.execute({
			drinkId: createdDrink._id.toString(),
			name: fileName,
			mimetype: fileMimetype,
			fileStream: mockedFileStream,
		});

		const findUpdatedDrink = (await drinksRepositoryInMemory.findById(createdDrink._id.toString())) as Drink;

		expect(findUpdatedDrink.thumbnail).toBeDefined();
		expect(findUpdatedDrink.thumbnail?.mimetype).toEqual(fileMimetype);
		expect(findUpdatedDrink.thumbnail?.name).toContain(fileName);
		expect(storageProvider.uploadFile).toHaveBeenCalledTimes(1);
	});

	it('should not be able to update the thumbnail to a non-image file', async () => {
		await expect(
			service.execute({
				drinkId: new ObjectId().toString(),
				name: fileName,
				mimetype: 'application/json',
				fileStream: mockedFileStream,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update the thumbnail of a nonexistent drink', async () => {
		await expect(
			service.execute({
				drinkId: new ObjectId().toString(),
				name: fileName,
				mimetype: fileMimetype,
				fileStream: mockedFileStream,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should be able to delete the existing drink thumbnail during the update', async () => {
		await drinksRepositoryInMemory.update({
			id: createdDrink._id.toString(),
			thumbnail: { name: fileMimetype, mimetype: fileMimetype, url: '' },
		});

		await service.execute({
			drinkId: createdDrink._id.toString(),
			name: fileName,
			mimetype: fileMimetype,
			fileStream: mockedFileStream,
		});

		expect(storageProvider.deleteFile).toHaveBeenCalledTimes(1);
	});

	it('should be able to add the file extension during the drink thumbnail update', async () => {
		await service.execute({
			drinkId: createdDrink._id.toString(),
			name: 'imageFileNameWithoutExtension',
			mimetype: fileMimetype,
			fileStream: mockedFileStream,
		});

		const foundDrink = (await drinksRepositoryInMemory.findById(createdDrink._id.toString())) as Drink;
		const drinkThumbnail = foundDrink.thumbnail as FileMetadata;

		expect(drinkThumbnail).toBeDefined();
		expect(drinkThumbnail).toHaveProperty('name');
		expect(hasFileExtension(drinkThumbnail.name, fileMimetype)).toBe(true);
	});
});
