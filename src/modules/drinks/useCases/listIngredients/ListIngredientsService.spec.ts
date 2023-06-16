import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { ListIngredientsService } from './ListIngredientsService';

let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let listIngredientsService: ListIngredientsService;

// test constants
const name = 'Ingredient test';
const category = 'test';
const unity = 'ml';
const colorTheme = '#000000';
const isAlcoholic = true;

describe('List Ingredients', () => {
	beforeEach(() => {
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		listIngredientsService = new ListIngredientsService(ingredientsRepositoryInMemory);
	});

	it('should be able to list all ingredients', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create({
			name,
			category,
			unity,
			isAlcoholic,
			colorTheme
		});

		const ingredientsFound = await listIngredientsService.execute();

		expect(ingredientsFound.length).toEqual(1);
	});
});
