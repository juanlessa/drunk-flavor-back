import AppError from '@errors/AppError';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateIngredientService } from './CreateIngredientService';

let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let createIngredientService: CreateIngredientService;

// test constants
const name = 'Ingredient test';
const category = 'test';
const unity = 'ml';
const colorTheme = '#000000';
const isAlcoholic = true;

describe('Create Ingredient', () => {
	beforeEach(() => {
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		createIngredientService = new CreateIngredientService(ingredientsRepositoryInMemory);
	});

	it('should be able to create a new ingredient', async () => {
		const result = await createIngredientService.execute({
			name,
			category,
			unity,
			isAlcoholic,
			colorTheme
		});

		const createdIngredient = await ingredientsRepositoryInMemory.findById(result.id);

		expect(createdIngredient).toHaveProperty('id');
		expect(createdIngredient.name).toEqual(name);
		expect(createdIngredient.category).toEqual(category);
		expect(createdIngredient.unity).toEqual(unity);
		expect(createdIngredient.isAlcoholic).toEqual(isAlcoholic);
		expect(createdIngredient.colorTheme).toEqual(colorTheme);
	});

	it('should not be able to create a ingredient with an existing name', async () => {
		await ingredientsRepositoryInMemory.create({
			name,
			category,
			unity,
			isAlcoholic,
			colorTheme
		});

		await expect(
			createIngredientService.execute({
				name,
				category,
				unity,
				isAlcoholic,
				colorTheme
			})
		).rejects.toEqual(new AppError('Ingredient already exists'));
	});
});
