import AppError from '@errors/AppError';
import { IIngredient } from '@modules/drinks/dtos/ingredients';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateIngredientService } from './CreateIngredientService';

const ingredientsRepository = vi.hoisted<IIngredientsRepository>(() => {
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

let createIngredientService: CreateIngredientService;

describe('Create Drink', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		createIngredientService = new CreateIngredientService(ingredientsRepository);
	});
	it('should be able to create a new ingredient', async () => {
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

		vi.mocked(ingredientsRepository.findByName).mockReturnValue(Promise.resolve(null as IIngredient));
		vi.mocked(ingredientsRepository.create).mockReturnValue(Promise.resolve({ ...ingredientTest, id }));

		const createdIngredientId = await createIngredientService.execute(ingredientTest);

		expect(ingredientsRepository.create).toHaveBeenCalledTimes(1);
		expect(ingredientsRepository.create).toHaveBeenCalledWith(ingredientTest);
		expect(createdIngredientId).toHaveProperty('id');
		expect(createdIngredientId.id).toEqual(id);
	});

	it('should not be able to create a ingredient with an existing name', async () => {
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

		vi.mocked(ingredientsRepository.findByName).mockReturnValue(Promise.resolve({ ...ingredientTest, id }));

		await expect(createIngredientService.execute(ingredientTest)).rejects.toEqual(
			new AppError('Ingredient already exists')
		);
	});
});
