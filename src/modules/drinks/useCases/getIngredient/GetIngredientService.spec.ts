import AppError from '@errors/AppError';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetIngredientService } from './GetIngredientService';

let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let getIngredientService: GetIngredientService;

// test constants
const name = 'Ingredient test';
const category = 'test';
const unity = 'ml';
const colorTheme = '#000000';
const isAlcoholic = true;

describe('Get Ingredient', () => {
	beforeEach(() => {
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		getIngredientService = new GetIngredientService(ingredientsRepositoryInMemory);
	});
	it('should be able to find an ingredient', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create({
			name,
			category,
			unity,
			isAlcoholic,
			colorTheme
		});

		const ingredientFound = await getIngredientService.execute({ id: createdIngredient.id });

		expect(ingredientFound.id).toEqual(createdIngredient.id);
		expect(ingredientFound.name).toEqual(createdIngredient.name);
		expect(ingredientFound.category).toEqual(createdIngredient.category);
		expect(ingredientFound.unity).toEqual(createdIngredient.unity);
		expect(ingredientFound.colorTheme).toEqual(createdIngredient.colorTheme);
		expect(ingredientFound.isAlcoholic).toEqual(createdIngredient.isAlcoholic);
	});

	it('should not be able to find a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();

		await expect(getIngredientService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError('Ingredient not found')
		);
	});
});
