import AppError from '@errors/AppError';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateIngredientService } from './UpdateIngredientService';

let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let updateIngredientService: UpdateIngredientService;

// test constants
const name = 'Ingredient test';
const category = 'test';
const unity = 'ml';
const colorTheme = '#000000';
const isAlcoholic = true;
const updatedName = 'New ingredient test';
const updatedCategory = 'new category test';
const updatedUnity = 'oz';
const updatedColorTheme = '#FFFFFF';
const updatedIsAlcoholic = false;

describe('Update Ingredient', () => {
	beforeEach(() => {
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		updateIngredientService = new UpdateIngredientService(ingredientsRepositoryInMemory);
	});

	it('should be able to update an ingredient', async () => {
		let createdIngredient = await ingredientsRepositoryInMemory.create({
			name,
			category,
			unity,
			isAlcoholic,
			colorTheme
		});

		await updateIngredientService.execute({
			id: createdIngredient.id,
			name: updatedName,
			category: updatedCategory,
			unity: updatedUnity,
			colorTheme: updatedColorTheme,
			isAlcoholic: updatedIsAlcoholic
		});

		createdIngredient = await ingredientsRepositoryInMemory.findById(createdIngredient.id);

		expect(createdIngredient.name).toEqual(updatedName);
		expect(createdIngredient.category).toEqual(updatedCategory);
		expect(createdIngredient.unity).toEqual(updatedUnity);
		expect(createdIngredient.name).toEqual(updatedName);
	});

	it('should not be able to update a nonexistent ingredient', async () => {
		await expect(
			updateIngredientService.execute({
				id: new ObjectId().toString(),
				name: updatedName,
				category: updatedCategory,
				unity: updatedUnity,
				colorTheme: updatedColorTheme,
				isAlcoholic: updatedIsAlcoholic
			})
		).rejects.toEqual(new AppError('Ingredient does not exist'));
	});

	it('should not be able to update an ingredient name to an existing name', async () => {
		let createdIngredient = await ingredientsRepositoryInMemory.create({
			name,
			category,
			unity,
			isAlcoholic,
			colorTheme
		});
		await ingredientsRepositoryInMemory.create({
			name: updatedName,
			category,
			unity,
			isAlcoholic,
			colorTheme
		});

		await expect(
			updateIngredientService.execute({
				id: createdIngredient.id,
				name: updatedName,
				category: updatedCategory,
				unity: updatedUnity,
				colorTheme: updatedColorTheme,
				isAlcoholic: updatedIsAlcoholic
			})
		).rejects.toEqual(new AppError('Ingredient name already exists'));
	});
});
