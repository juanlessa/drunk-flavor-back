import AppError from '@errors/AppError';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteIngredientService } from './DeleteIngredientService';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { ObjectId } from 'bson';

let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let deleteIngredientService: DeleteIngredientService;

// test constants
const name = 'Ingredient test';
const category = 'test';
const unity = 'ml';
const colorTheme = '#000000';
const isAlcoholic = true;

describe('Delete Ingredient', () => {
	beforeEach(() => {
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory(ingredientsRepositoryInMemory);
		deleteIngredientService = new DeleteIngredientService(ingredientsRepositoryInMemory, drinksRepositoryInMemory);
	});
	it('should be able to delete an ingredient', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create({
			name,
			category,
			unity,
			isAlcoholic,
			colorTheme
		});

		await deleteIngredientService.execute({ id: createdIngredient.id });

		const findDeledIngredient = await ingredientsRepositoryInMemory.findById(createdIngredient.id);

		expect(findDeledIngredient).toBeUndefined();
	});

	it('should not be able to delete a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(deleteIngredientService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError('Ingredient does not exist')
		);
	});

	it('should delete the ingredient from the existing drinks', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create({
			name,
			category,
			unity,
			isAlcoholic,
			colorTheme
		});
		let createdDrink = await drinksRepositoryInMemory.create({
			name: 'Drink',
			method: 'test',
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 1 }]
		});

		await deleteIngredientService.execute({ id: createdIngredient.id });

		createdDrink = await drinksRepositoryInMemory.findById(createdDrink.id);

		expect(createdDrink.ingredients.length).toEqual(0);
	});
});
