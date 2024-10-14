import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { ObjectId } from 'mongodb';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createDrinkFactory } from '@/core/drinks/factories/drink.factories';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { UpdateDrinkCoverService } from './UpdateDrinkCover.service';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';
import { Readable } from 'node:stream';
import { hasFileExtension } from '@/shared/helpers/file.helpers';
import { FileMetadata } from '@/shared/types/file.types';

let categoriesRepository: ICategoriesRepository;
let ingredientsRepository: IIngredientsRepository;
let drinksRepository: IDrinksRepository;
let storageProvider: IStorageProvider;
let service: UpdateDrinkCoverService;

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

		categoriesRepository = new CategoriesRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		drinksRepository = new DrinksRepositoryInMemory();
		storageProvider = new MockStorageProvider();
		service = new UpdateDrinkCoverService(drinksRepository, storageProvider);

		const category = await categoriesRepository.create({ translations: categoryTranslations });
		ingredient = await ingredientsRepository.create({
			translations: translationsIngredient,
			is_alcoholic: false,
			category: category,
		});
		createdDrink = await drinksRepository.create({
			translations,
			ingredients: [{ quantity: 30, ingredient }],
		});
	});

	afterAll(async () => {
		vi.clearAllMocks();
	});

	it('should be able to update a drink cover', async () => {
		await service.execute({
			drinkId: createdDrink._id.toString(),
			name: fileName,
			mimetype: fileMimetype,
			fileStream: mockedFileStream,
		});

		const findUpdatedDrink = (await drinksRepository.findById(createdDrink._id.toString())) as Drink;

		expect(findUpdatedDrink.cover).toBeDefined();
		expect(findUpdatedDrink.cover?.mimetype).toEqual(fileMimetype);
		expect(findUpdatedDrink.cover?.name).toContain(fileName);
		expect(storageProvider.uploadFile).toHaveBeenCalledTimes(1);
	});

	it('should not be able to update the cover to a non-image file', async () => {
		await expect(
			service.execute({
				drinkId: new ObjectId().toString(),
				name: fileName,
				mimetype: 'application/json',
				fileStream: mockedFileStream,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update the cover of a nonexistent drink', async () => {
		await expect(
			service.execute({
				drinkId: new ObjectId().toString(),
				name: fileName,
				mimetype: fileMimetype,
				fileStream: mockedFileStream,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should be able to delete the existing drink cover during the update', async () => {
		await drinksRepository.update({
			id: createdDrink._id.toString(),
			cover: { name: fileMimetype, mimetype: fileMimetype, url: '' },
		});

		await service.execute({
			drinkId: createdDrink._id.toString(),
			name: fileName,
			mimetype: fileMimetype,
			fileStream: mockedFileStream,
		});

		expect(storageProvider.deleteFile).toHaveBeenCalledTimes(1);
	});

	it('should be able to add the file extension during the drink cover update', async () => {
		await service.execute({
			drinkId: createdDrink._id.toString(),
			name: 'imageFileNameWithoutExtension',
			mimetype: fileMimetype,
			fileStream: mockedFileStream,
		});

		const foundDrink = (await drinksRepository.findById(createdDrink._id.toString())) as Drink;
		const drinkCover = foundDrink.cover as FileMetadata;

		expect(drinkCover).toBeDefined();
		expect(drinkCover).toHaveProperty('name');
		expect(hasFileExtension(drinkCover.name, fileMimetype)).toBe(true);
	});
});
