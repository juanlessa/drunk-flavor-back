import AppError from '@errors/AppError';
import { ICreateIngredient } from '@modules/drinks/dtos/ingredients';
import { DRINK_ERRORS } from '@modules/drinks/errors/drinkErrors';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateDrinkService } from './CreateDrinkService';

let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let createDrinkService: CreateDrinkService;

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

describe('Create Drink', () => {
	beforeEach(() => {
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory(ingredientsRepositoryInMemory);
		createDrinkService = new CreateDrinkService(drinksRepositoryInMemory, ingredientsRepositoryInMemory);
	});

	it('should be able to create a new drink', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create(testIngredient1);

		const createdDrinkId = await createDrinkService.execute({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		const createdDrink = await drinksRepositoryInMemory.findById(createdDrinkId.id);

		expect(createdDrinkId).toHaveProperty('id');
		expect(createdDrink).toHaveProperty('id');
		expect(createdDrink.name).toEqual(name);
		expect(createdDrink.method).toEqual(method);
		expect(createdDrink.ingredients.length).toEqual(1);
	});

	it('should not be able to create a drink with an existing name', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create(testIngredient1);
		await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		await expect(
			createDrinkService.execute({
				name,
				method,
				ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
			})
		).rejects.toEqual(new AppError(DRINK_ERRORS.already_exist));
	});

	it('should not be able to create a drink with a nonexistent ingredient', async () => {
		await expect(
			createDrinkService.execute({
				name,
				method,
				ingredients: [{ ingredientId: new ObjectId().toString(), quantity: 60 }]
			})
		).rejects.toEqual(new AppError(DRINK_ERRORS.some_ingredients_not_exist));
	});
});
