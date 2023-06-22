import AppError from '@errors/AppError';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateDrinkService } from './UpdateDrinkService';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ICreateIngredient } from '@modules/drinks/dtos/ingredients';
import { ObjectId } from 'bson';

let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let updateDrinkService: UpdateDrinkService;

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
const updatedName = 'Updated drink name';
const updatedMethod = 'Updated drink recept ...';

describe('Update Drink', () => {
	beforeEach(() => {
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory(ingredientsRepositoryInMemory);
		updateDrinkService = new UpdateDrinkService(drinksRepositoryInMemory, ingredientsRepositoryInMemory);
	});

	it('should be able to update a drink', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create(testIngredient1);
		const createdDrink = await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		await updateDrinkService.execute({
			id: createdDrink.id,
			name: updatedName,
			method: updatedMethod,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 15 }]
		});

		const updatedDrink = await drinksRepositoryInMemory.findById(createdDrink.id);

		expect(updatedDrink.name).toEqual(updatedName);
		expect(updatedDrink.method).toEqual(updatedMethod);
	});

	it('should not be able to update a nonexistent drink', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create(testIngredient1);
		const nonexistentDrinkId = new ObjectId().toString();

		await expect(
			updateDrinkService.execute({
				id: nonexistentDrinkId,
				name: updatedName,
				method: updatedMethod,
				ingredients: [{ ingredientId: createdIngredient.id, quantity: 12 }]
			})
		).rejects.toEqual(new AppError('Drink does not exist'));
	});

	it('should not be able to update drink name to an already existing name', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create(testIngredient1);
		const createdDrink = await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});
		await drinksRepositoryInMemory.create({
			name: updatedName,
			method: updatedMethod,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 12 }]
		});

		await expect(
			updateDrinkService.execute({
				id: createdDrink.id,
				name: updatedName,
				method: updatedMethod,
				ingredients: [{ ingredientId: createdIngredient.id, quantity: 12 }]
			})
		).rejects.toEqual(new AppError('Drink name already exists'));
	});

	it('should not be able to update a drink to add a nonexistent ingredient', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create(testIngredient1);
		const createdDrink = await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});
		const nonexistentIngredientId = new ObjectId().toString();

		await expect(
			updateDrinkService.execute({
				id: createdDrink.id,
				name: updatedName,
				method: updatedMethod,
				ingredients: [{ ingredientId: nonexistentIngredientId, quantity: 12 }]
			})
		).rejects.toEqual(new AppError("Some ingredients don't exist"));
	});
});
