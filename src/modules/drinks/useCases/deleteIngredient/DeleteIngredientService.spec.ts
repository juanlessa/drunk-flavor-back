import AppError from '@errors/AppError';
import { IIngredient } from '@modules/drinks/dtos/ingredients';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteIngredientService } from './DeleteIngredientService';

const drinksRepositoryMock = vi.hoisted<IDrinksRepository>(() => {
	return {
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		findByName: vi.fn(),
		findById: vi.fn(),
		findAll: vi.fn(),
		findByNameWithIngredientsDetails: vi.fn(),
		findByIdWithIngredientsDetails: vi.fn(),
		findAllWithIngredientsDetails: vi.fn(),
		removeDeletedIngredient: vi.fn()
	};
});
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

let deleteIngredientService: DeleteIngredientService;

// test constants
const id = '00000a000a0000000a000000';
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

describe('Delete Ingredient', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		deleteIngredientService = new DeleteIngredientService(ingredientsRepositoryMock, drinksRepositoryMock);
	});
	it('should be able to delete an ingredient', async () => {
		vi.mocked(ingredientsRepositoryMock.findById).mockReturnValue(Promise.resolve({ ...ingredientTest, id }));
		vi.mocked(ingredientsRepositoryMock.delete).mockReturnValue(Promise.resolve({ ...ingredientTest, id }));
		vi.mocked(drinksRepositoryMock.removeDeletedIngredient).mockReturnValue(Promise.resolve());

		await deleteIngredientService.execute({ id });

		expect(ingredientsRepositoryMock.delete).toHaveBeenCalledTimes(1);
		expect(ingredientsRepositoryMock.delete).toHaveBeenCalledWith(id);
		expect(drinksRepositoryMock.removeDeletedIngredient).toHaveBeenCalledTimes(1);
		expect(drinksRepositoryMock.removeDeletedIngredient).toHaveBeenCalledWith(id);
	});

	it('should not be able to delete a nonexistent ingredient', async () => {
		vi.mocked(ingredientsRepositoryMock.findById).mockReturnValue(Promise.resolve(null as IIngredient));

		await expect(deleteIngredientService.execute({ id })).rejects.toEqual(
			new AppError('Ingredient does not exist')
		);
	});
});
