import AppError from '@errors/AppError';
import { ICreateIngredient } from '@modules/drinks/dtos/ingredients';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateDrinkThumbnailService } from './UpdateDrinkThumbnailService';

let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let updateDrinkThumbnailService: UpdateDrinkThumbnailService;

// test constants
const name = 'Drink test name';
const method = 'drink recept...';
const thumbnailFileName = 'file-name.jpeg';
const testIngredient1: ICreateIngredient = {
	name: 'Ingredient 1',
	category: 'Test',
	unity: 'ml',
	colorTheme: '#000000',
	isAlcoholic: true
};

describe('Update Drink Thumbnail', () => {
	beforeEach(() => {
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory(ingredientsRepositoryInMemory);
		updateDrinkThumbnailService = new UpdateDrinkThumbnailService(drinksRepositoryInMemory);
	});

	it('should be able to update a drink thumbnail', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create(testIngredient1);
		const createdDrink = await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		await updateDrinkThumbnailService.execute({
			drinkId: createdDrink.id,
			thumbnailFile: thumbnailFileName
		});

		const updatedDrink = await drinksRepositoryInMemory.findById(createdDrink.id);

		expect(updatedDrink.thumbnail).toEqual(thumbnailFileName);
		expect(updatedDrink.id).toEqual(createdDrink.id);
	});

	it('should not be able to update the thumbnail of a nonexistent drink', async () => {
		const nonexistentDrinkId = new ObjectId().toString();

		await expect(
			updateDrinkThumbnailService.execute({
				drinkId: nonexistentDrinkId,
				thumbnailFile: thumbnailFileName
			})
		).rejects.toEqual(new AppError('Drink does not exit'));
	});
});
