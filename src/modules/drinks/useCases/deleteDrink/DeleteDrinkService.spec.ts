import AppError from '@errors/AppError';
import { IDrink } from '@modules/drinks/dtos/Drinks';
import { IIngredient } from '@modules/drinks/dtos/ingredients';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteDrinkService } from './DeleteDrinkService';

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

let deleteDrinkService: DeleteDrinkService;

// test constants
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

describe('Delete Drink', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		deleteDrinkService = new DeleteDrinkService(drinksRepositoryMock);
	});
	it('should be able to delete a drink', async () => {
		vi.mocked(drinksRepositoryMock.findById).mockReturnValue(Promise.resolve({ ...drinkTest, id: testId }));
		vi.mocked(drinksRepositoryMock.delete).mockReturnValue(Promise.resolve({ ...drinkTest, id: testId }));

		await deleteDrinkService.execute({ id: testId });

		expect(drinksRepositoryMock.delete).toHaveBeenCalledTimes(1);
		expect(drinksRepositoryMock.delete).toHaveBeenCalledWith(testId);
	});

	it('should not be able to delete a nonexistent drink', async () => {
		vi.mocked(drinksRepositoryMock.findById).mockReturnValue(Promise.resolve(null as IDrink));

		await expect(deleteDrinkService.execute({ id: testId })).rejects.toEqual(new AppError('Drink does not exist'));
	});
});
