import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListDrinksService } from './ListDrinksService';
import { ICreateIngredient } from '@modules/drinks/dtos/ingredients';

let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let listDrinksService: ListDrinksService;

// test constants
const testIngredient1: ICreateIngredient = {
	name: 'Ingredient 1',
	category: 'Test',
	unity: 'ml',
	colorTheme: '#000000',
	isAlcoholic: true
};
describe('List Drinks', () => {
	beforeEach(() => {
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory(ingredientsRepositoryInMemory);
		listDrinksService = new ListDrinksService(drinksRepositoryInMemory);
	});

	it('should be able to list all drinks', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create(testIngredient1);
		await drinksRepositoryInMemory.create({
			name: 'Drink Test 1',
			method: 'Drink recept ...',
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});
		await drinksRepositoryInMemory.create({
			name: 'Drink Test 2',
			method: 'Drink recept ...',
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		const drinksFound = await listDrinksService.execute();

		expect(drinksFound.length).toEqual(2);
	});
});
