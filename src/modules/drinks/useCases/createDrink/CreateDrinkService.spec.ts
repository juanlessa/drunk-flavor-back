import AppError from '@errors/AppError';
import { IDrink } from '@modules/drinks/dtos/Drinks';
import { IIngredient } from '@modules/drinks/dtos/ingredients';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateDrinkService } from './CreateDrinkService';

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

let createDrinkService: CreateDrinkService;

describe('Create Drink', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		createDrinkService = new CreateDrinkService(drinksRepository, ingredientsRepository);
	});
	it('should be able to create a new drink', async () => {
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

		vi.mocked(drinksRepository.findByName).mockReturnValue(Promise.resolve(null as IDrink));
		vi.mocked(ingredientsRepository.findByIdList).mockReturnValue(Promise.resolve([ingredient1, ingredient2]));
		vi.mocked(drinksRepository.create).mockReturnValue(Promise.resolve({ ...drinkTest, id: testId }));

		const createdDrinkId = await createDrinkService.execute(drinkTest);

		expect(drinksRepository.create).toHaveBeenCalledTimes(1);
		expect(drinksRepository.create).toHaveBeenCalledWith(drinkTest);
		expect(createdDrinkId).toHaveProperty('id');
		expect(createdDrinkId.id).toEqual(testId);
	});

	it('should not be able to create a drink with an existing name', async () => {
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

		vi.mocked(drinksRepository.findByName).mockReturnValue(Promise.resolve({ ...drinkTest, id: testId }));

		await expect(createDrinkService.execute(drinkTest)).rejects.toEqual(new AppError('Drink already exists'));
	});

	it('should not be able to create a drink with a nonexistent ingredient', async () => {
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

		vi.mocked(drinksRepository.findByName).mockReturnValue(Promise.resolve(null as IDrink));
		vi.mocked(ingredientsRepository.findByIdList).mockReturnValue(Promise.resolve([ingredient1]));

		await expect(createDrinkService.execute(drinkTest)).rejects.toEqual(
			new AppError("Some ingredients don't exist")
		);
	});
});
