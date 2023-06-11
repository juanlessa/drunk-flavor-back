import AppError from '@errors/AppError';
import { IDrink } from '@modules/drinks/dtos/Drinks';
import { IIngredient } from '@modules/drinks/dtos/ingredients';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteDrinkService } from './DeleteDrinkService';

const drinksRepository = vi.hoisted<IDrinksRepository>(() => {
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

let deleteDrinkService: DeleteDrinkService;

describe('Delete Drink', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		deleteDrinkService = new DeleteDrinkService(drinksRepository);
	});
	it('should be able to delete a drink', async () => {
		const name = 'Test drink name';
		const method = 'drink recept...';
		const ingredient1: IIngredient = {
			id: '00000a000a0000000a000000',
			name: 'Ingredient 1',
			category: 'test',
			unity: 'ml',
			colorTheme: '#000000',
			isAlcoholic: true
		};
		const ingredient2: IIngredient = {
			id: '11111a111a1111111a111111',
			name: 'Ingredient 1',
			category: 'test',
			unity: 'ml',
			colorTheme: '#000000',
			isAlcoholic: true
		};

		const testId = 'drinkId00a0000000a000000';
		const drinkTest: IDrink = {
			name,
			method,
			ingredients: [
				{
					ingredientId: ingredient1.id,
					quantity: 1
				},
				{
					ingredientId: ingredient2.id,
					quantity: 1
				}
			]
		};

		vi.mocked(drinksRepository.findById).mockReturnValue(Promise.resolve({ ...drinkTest, id: testId }));
		vi.mocked(drinksRepository.delete).mockReturnValue(Promise.resolve({ ...drinkTest, id: testId }));

		await deleteDrinkService.execute({ id: testId });

		expect(drinksRepository.delete).toHaveBeenCalledTimes(1);
		expect(drinksRepository.delete).toHaveBeenCalledWith(testId);
	});

	it('should not be able to delete a nonexistent drink', async () => {
		const name = 'Test drink name';
		const method = 'drink recept...';
		const ingredient1: IIngredient = {
			id: '00000a000a0000000a000000',
			name: 'Ingredient 1',
			category: 'test',
			unity: 'ml',
			colorTheme: '#000000',
			isAlcoholic: true
		};
		const ingredient2: IIngredient = {
			id: '11111a111a1111111a111111',
			name: 'Ingredient 1',
			category: 'test',
			unity: 'ml',
			colorTheme: '#000000',
			isAlcoholic: true
		};

		const testId = 'drinkId00a0000000a000000';
		const drinkTest: IDrink = {
			name,
			method,
			ingredients: [
				{
					ingredientId: ingredient1.id,
					quantity: 1
				},
				{
					ingredientId: ingredient2.id,
					quantity: 1
				}
			]
		};

		vi.mocked(drinksRepository.findById).mockReturnValue(Promise.resolve(null as IDrink));

		await expect(deleteDrinkService.execute({ id: testId })).rejects.toEqual(new AppError('Drink does not exist'));
	});
});
