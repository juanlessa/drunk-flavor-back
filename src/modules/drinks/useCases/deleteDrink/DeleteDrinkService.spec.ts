import AppError from '@errors/AppError';
import { ICreateIngredient } from '@modules/drinks/dtos/ingredients';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteDrinkService } from './DeleteDrinkService';

let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let deleteDrinkService: DeleteDrinkService;

// test constants
const name = 'Drink test name';
const method = 'drink recept...';
const testIngredient1: ICreateIngredient = {
	name: 'Ingredient 1',
	category: 'Test',
	unity: 'ml',
	colorTheme: '#000000',
	isAlcoholic: true
};

describe('Delete Drink', () => {
	beforeEach(() => {
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory(ingredientsRepositoryInMemory);
		deleteDrinkService = new DeleteDrinkService(drinksRepositoryInMemory);
	});
	it('should be able to delete a drink', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create(testIngredient1);
		let createdDrink = await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		await deleteDrinkService.execute({ id: createdDrink.id });

		createdDrink = await drinksRepositoryInMemory.findById(createdDrink.id);

		expect(createdDrink).toBeUndefined();
	});

	it('should not be able to delete a nonexistent drink', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(deleteDrinkService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError('Drink does not exist')
		);
	});
});
