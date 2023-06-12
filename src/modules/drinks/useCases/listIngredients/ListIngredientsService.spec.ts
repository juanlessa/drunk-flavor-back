import { IIngredient } from '@modules/drinks/dtos/ingredients';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListIngredientsService } from './ListIngredientsService';

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

let listIngredientsService: ListIngredientsService;

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

describe('List Ingredients', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		listIngredientsService = new ListIngredientsService(ingredientsRepositoryMock);
	});

	it('should be able to list all ingredients', async () => {
		vi.mocked(ingredientsRepositoryMock.findAll).mockReturnValue(Promise.resolve([{ ...ingredientTest, id }]));

		const ingredientsFound = await listIngredientsService.execute();

		expect(ingredientsRepositoryMock.findAll).toHaveBeenCalledTimes(1);
	});
});
