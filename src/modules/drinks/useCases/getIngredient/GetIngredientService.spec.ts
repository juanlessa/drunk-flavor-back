import AppError from '@errors/AppError';
import { IIngredient } from '@modules/drinks/dtos/ingredients';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetIngredientService } from './GetIngredientService';

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

let getIngredientService: GetIngredientService;

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

describe('Get Ingredient', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getIngredientService = new GetIngredientService(ingredientsRepositoryMock);
	});
	it('should be able to find an ingredient', async () => {
		vi.mocked(ingredientsRepositoryMock.findById).mockReturnValue(Promise.resolve({ ...ingredientTest, id }));

		const ingredientFound = await getIngredientService.execute({ id });

		expect(ingredientsRepositoryMock.findById).toHaveBeenCalledTimes(1);
		expect(ingredientsRepositoryMock.findById).toHaveBeenCalledWith(id);
		expect(ingredientFound).toHaveProperty('id');
		expect(ingredientFound.id).toEqual(id);
	});

	it('should not be able to find a nonexistent ingredient', async () => {
		vi.mocked(ingredientsRepositoryMock.findById).mockReturnValue(Promise.resolve(null as IIngredient));

		await expect(getIngredientService.execute({ id })).rejects.toEqual(new AppError('Ingredient not found'));
	});
});
