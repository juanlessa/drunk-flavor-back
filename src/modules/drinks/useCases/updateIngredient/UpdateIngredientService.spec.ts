import AppError from '@errors/AppError';
import { IIngredient } from '@modules/drinks/dtos/ingredients';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateIngredientService } from './UpdateIngredientService';

const ingredientsRepositoryMock = vi.hoisted<IIngredientsRepository>(() => {
	return {
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		findByName: vi.fn(),
		findById: vi.fn(),
		findAll: vi.fn(),
		findByIdList: vi.fn()
	};
});

let updateIngredientService: UpdateIngredientService;

// test constants
const id = '00000a000a0000000a000000';
const differentId = '11111b111b1111111b111111';
const name = 'Ingredient test';
const category = 'test';
const unity = 'ml';
const colorTheme = '#000000';
const isAlcoholic = true;
const ingredientTest: IIngredient = {
	name,
	category,
	unity,
	colorTheme,
	isAlcoholic
};
const updatedName = 'New ingredient test';
const updatedCategory = 'new category test';
const updatedUnity = 'oz';
const updatedColorTheme = '#FFFFFF';
const updatedIsAlcoholic = false;
const updatedIngredientTest: IIngredient = {
	name: updatedName,
	category: updatedCategory,
	unity: updatedUnity,
	colorTheme: updatedColorTheme,
	isAlcoholic: updatedIsAlcoholic
};

describe('Update Ingredient', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		updateIngredientService = new UpdateIngredientService(ingredientsRepositoryMock);
	});

	it('should be able to update an ingredient', async () => {
		vi.mocked(ingredientsRepositoryMock.findById).mockReturnValue(Promise.resolve({ ...ingredientTest, id }));
		vi.mocked(ingredientsRepositoryMock.findByName).mockReturnValue(Promise.resolve({ ...ingredientTest, id }));
		vi.mocked(ingredientsRepositoryMock.update).mockReturnValue(Promise.resolve({ ...updatedIngredientTest, id }));

		await updateIngredientService.execute({ ...updatedIngredientTest, id });

		expect(ingredientsRepositoryMock.findById).toHaveBeenCalledTimes(1);
		expect(ingredientsRepositoryMock.findById).toHaveBeenCalledWith(id);
		expect(ingredientsRepositoryMock.findByName).toHaveBeenCalledTimes(1);
		expect(ingredientsRepositoryMock.findByName).toHaveBeenCalledWith(updatedName);
		expect(ingredientsRepositoryMock.update).toHaveBeenCalledTimes(1);
		expect(ingredientsRepositoryMock.update).toHaveBeenCalledWith({ ...updatedIngredientTest, id });
	});

	it('should not be able to update a nonexistent ingredient', async () => {
		vi.mocked(ingredientsRepositoryMock.findById).mockReturnValue(Promise.resolve(null as IIngredient));

		await expect(updateIngredientService.execute({ ...updatedIngredientTest, id })).rejects.toEqual(
			new AppError('Ingredient does not exist')
		);
	});

	it('should not be able to update an ingredient name to an existing name', async () => {
		vi.mocked(ingredientsRepositoryMock.findById).mockReturnValue(Promise.resolve({ ...ingredientTest, id }));
		vi.mocked(ingredientsRepositoryMock.findByName).mockReturnValue(
			Promise.resolve({ ...ingredientTest, id: differentId })
		);

		await expect(updateIngredientService.execute({ ...updatedIngredientTest, id })).rejects.toEqual(
			new AppError('Ingredient name already exists')
		);
	});
});
