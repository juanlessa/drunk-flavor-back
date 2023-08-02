import AppError from '@errors/AppError';
import { ICreateIngredient } from '@modules/drinks/dtos/ingredients';
import { DRINK_ERRORS } from '@modules/drinks/errors/drinkErrors';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateDrinkService } from './CreateDrinkService';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/CategoriesRepository';
import Category from '@modules/drinks/entities/Category';
import Ingredient from '@modules/drinks/entities/Ingredient';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let createDrinkService: CreateDrinkService;

// test constants
const name = 'Drink test name';
const method = 'drink recept...';
const ingredientName = 'Ingredient test';
const ingredientCategoryName = 'Category test';
const ingredientUnitySingular = 'ml';
const ingredientUnityPlural = 'ml';
const ingredientIsAlcoholic = true;
let createdCategory: Category;
let createdIngredient: Ingredient;

describe('Create Drink', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory(categoriesRepositoryInMemory);
		drinksRepositoryInMemory = new DrinksRepositoryInMemory(ingredientsRepositoryInMemory);
		createDrinkService = new CreateDrinkService(drinksRepositoryInMemory, ingredientsRepositoryInMemory);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ name: ingredientCategoryName });
		createdIngredient = await ingredientsRepositoryInMemory.create({
			name: ingredientName,
			categoryId: createdCategory.id,
			unitySingular: ingredientUnitySingular,
			unityPlural: ingredientUnityPlural,
			isAlcoholic: ingredientIsAlcoholic
		});
	});

	it('should be able to create a new drink', async () => {
		await createDrinkService.execute({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		const createdDrink = await drinksRepositoryInMemory.findByNameWithIngredientsDetails(name);

		expect(createdDrink).toHaveProperty('id');
		expect(createdDrink.name).toEqual(name);
		expect(createdDrink.method).toEqual(method);
		expect(createdDrink.ingredients.length).toEqual(1);
	});

	it('should not be able to create a drink with an existing name', async () => {
		await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		await expect(
			createDrinkService.execute({
				name,
				method,
				ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
			})
		).rejects.toEqual(new AppError(DRINK_ERRORS.already_exist));
	});

	it('should not be able to create a drink with a nonexistent ingredient', async () => {
		await expect(
			createDrinkService.execute({
				name,
				method,
				ingredients: [{ ingredientId: new ObjectId().toString(), quantity: 60 }]
			})
		).rejects.toEqual(new AppError(DRINK_ERRORS.some_ingredients_not_exist));
	});
});
