import AppError from '@errors/AppError';
import { IDrink, IDrinkResponse } from '@modules/drinks/dtos/Drinks';
import { IIngredient } from '@modules/drinks/dtos/ingredients';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetDrinkService } from './GetDrinkService';

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

let getDrinkService: GetDrinkService;

// test constants
const name = 'Test drink name';
const method = 'drink recept...';
const cover = 'cover-test-image.png';
const thumbnail = 'thumbnail-test-image.jpeg';
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
const drinkTest: IDrinkResponse = {
	name,
	method,
	cover,
	thumbnail,
	ingredients: [
		{
			ingredientId: ingredient1.id,
			quantity: 1,
			name: ingredient1.name,
			category: ingredient1.category,
			unity: ingredient1.unity,
			colorTheme: ingredient1.colorTheme,
			isAlcoholic: ingredient1.isAlcoholic
		},
		{
			ingredientId: ingredient2.id,
			quantity: 1,
			name: ingredient1.name,
			category: ingredient1.category,
			unity: ingredient1.unity,
			colorTheme: ingredient1.colorTheme,
			isAlcoholic: ingredient1.isAlcoholic
		}
	]
};

describe('Get Drink', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getDrinkService = new GetDrinkService(drinksRepositoryMock);
	});

	it('should be able to find a drink', async () => {
		vi.mocked(drinksRepositoryMock.findByIdWithIngredientsDetails).mockReturnValue(
			Promise.resolve([{ ...drinkTest, id: testId }])
		);

		const result = await getDrinkService.execute({ id: testId });

		expect(drinksRepositoryMock.findByIdWithIngredientsDetails).toHaveBeenCalledTimes(1);
		expect(drinksRepositoryMock.findByIdWithIngredientsDetails).toHaveBeenCalledWith(testId);
		expect(result).toHaveProperty('id');
		expect(result.id).toEqual(testId);
	});

	it('should not be able to find a nonexistent drink', async () => {
		vi.mocked(drinksRepositoryMock.findByIdWithIngredientsDetails).mockReturnValue(Promise.resolve([]));

		await expect(getDrinkService.execute({ id: testId })).rejects.toEqual(new AppError('Drink not found'));
	});
});
