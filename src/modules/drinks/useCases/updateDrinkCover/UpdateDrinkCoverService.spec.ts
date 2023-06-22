import AppError from '@errors/AppError';
import { ICreateIngredient } from '@modules/drinks/dtos/ingredients';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateDrinkCoverService } from './UpdateDrinkCoverService';

let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let updateDrinkCoverService: UpdateDrinkCoverService;

// test constants
const name = 'Drink test name';
const method = 'drink recept...';
const coverFileName = 'file-name.jpeg';
const testIngredient1: ICreateIngredient = {
	name: 'Ingredient 1',
	category: 'Test',
	unity: 'ml',
	colorTheme: '#000000',
	isAlcoholic: true
};

describe('Update Drink Cover', () => {
	beforeEach(() => {
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory(ingredientsRepositoryInMemory);
		updateDrinkCoverService = new UpdateDrinkCoverService(drinksRepositoryInMemory);
	});

	it('should be able to update a drink cover', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create(testIngredient1);
		const createdDrink = await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		await updateDrinkCoverService.execute({
			drinkId: createdDrink.id,
			coverFile: coverFileName
		});

		const updatedDrink = await drinksRepositoryInMemory.findById(createdDrink.id);

		expect(updatedDrink.cover).toEqual(coverFileName);
		expect(updatedDrink.id).toEqual(createdDrink.id);
	});

	it('should not be able to update the cover of a nonexistent drink', async () => {
		const nonexistentDrinkId = new ObjectId().toString();

		await expect(
			updateDrinkCoverService.execute({
				drinkId: nonexistentDrinkId,
				coverFile: coverFileName
			})
		).rejects.toEqual(new AppError('Drink does not exit'));
	});
});
