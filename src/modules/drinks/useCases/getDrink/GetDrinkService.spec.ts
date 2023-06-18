import AppError from '@errors/AppError';
import { ICreateIngredient } from '@modules/drinks/dtos/ingredients';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetDrinkService } from './GetDrinkService';

let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let getDrinkService: GetDrinkService;

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

describe('Get Drink', () => {
	beforeEach(() => {
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory(ingredientsRepositoryInMemory);
		getDrinkService = new GetDrinkService(drinksRepositoryInMemory);
	});

	it('should be able to find a drink', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create(testIngredient1);
		let createdDrink = await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		const result = await getDrinkService.execute({ id: createdDrink.id });

		expect(result.id).toEqual(createdDrink.id);
		expect(result.name).toEqual(createdDrink.name);
		expect(result.method).toEqual(createdDrink.method);
	});

	it('should not be able to find a nonexistent drink', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(getDrinkService.execute({ id: nonexistentId })).rejects.toEqual(new AppError('Drink not found'));
	});
});
