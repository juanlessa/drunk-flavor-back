import { beforeEach, describe, expect, it } from 'vitest';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { ObjectId } from 'mongodb';
import { UpdateDrinkService } from './UpdateDrink.service';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { NotFoundError, ConflictError, BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import {
	createDrinkFactory,
	createDrinkIngredientFactory,
	createDrinkIngredientInputFactory,
} from '@/core/drinks/factories/drink.factories';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { Drink } from '@/core/drinks/entities/drink.entity';

let categoriesRepository: ICategoriesRepository;
let ingredientsRepository: IIngredientsRepository;
let unitsRepository: IUnitsRepository;
let drinksRepository: IDrinksRepository;
let service: UpdateDrinkService;

const { translations: categoryTranslations } = createCategoryFactory();
const { translations: translationsIngredient } = createIngredientFactory();

const { translations } = createDrinkFactory();

const { translations: updatedTranslations } = createDrinkFactory({
	translations: {
		en: { name: 'cosmopolitan', method: 'preparation mode' },
		pt: { name: 'cosmopolitan', method: 'modo de preparo' },
	},
});

let ingredient: Ingredient;
let unit: Unit;
let createdDrink: Drink;

const amount = (quantity: number) => ({ type: 'exact' as const, quantity, unit });

describe('Update Drink', () => {
	beforeEach(async () => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		unitsRepository = new UnitsRepositoryInMemory();
		drinksRepository = new DrinksRepositoryInMemory();
		service = new UpdateDrinkService(drinksRepository, ingredientsRepository);

		const category = await categoriesRepository.create({ translations: categoryTranslations, isAlcoholic: false });
		unit = await unitsRepository.create(createUnitFactory());
		ingredient = await ingredientsRepository.create({
			translations: translationsIngredient,
			category: category,
			units: [unit],
		});
		createdDrink = await drinksRepository.create({
			translations,
			ingredients: [createDrinkIngredientFactory(ingredient, { amount: amount(30) })],
		});
	});

	it('should be able to update a drink', async () => {
		await service.execute({
			id: createdDrink.id,
			translations: updatedTranslations,
			ingredients: [createDrinkIngredientInputFactory(ingredient.id, { unitId: unit.id })],
			garnishes: [],
		});

		const findUpdatedDrink = (await drinksRepository.findById(createdDrink.id)) as Drink;

		expect(findUpdatedDrink.translations).toEqual(updatedTranslations);
		expect(findUpdatedDrink.ingredients.length).toEqual(1);
		expect(findUpdatedDrink.ingredients[0].amount).toEqual({ type: 'exact', quantity: 60, unit });
	});

	it('should not be able to update a nonexistent drink', async () => {
		await expect(
			service.execute({
				id: new ObjectId().toString(),
				translations: updatedTranslations,
				ingredients: [createDrinkIngredientInputFactory(ingredient.id, { unitId: unit.id })],
				garnishes: [],
			}),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('should not be able to update a drink name to an existing name', async () => {
		await drinksRepository.create({
			translations: updatedTranslations,
			ingredients: [createDrinkIngredientFactory(ingredient, { amount: amount(30) })],
		});

		await expect(
			service.execute({
				id: createdDrink.id,
				translations: updatedTranslations,
				ingredients: [createDrinkIngredientInputFactory(ingredient.id, { unitId: unit.id })],
				garnishes: [],
			}),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('should not be able to update a drink with a nonexistent ingredient', async () => {
		await expect(
			service.execute({
				id: createdDrink.id,
				translations: updatedTranslations,
				ingredients: [createDrinkIngredientInputFactory(new ObjectId().toString(), { unitId: unit.id })],
				garnishes: [],
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	describe('garnishes and recipe rules', () => {
		let mint: Ingredient;

		const mainLine = () => createDrinkIngredientInputFactory(ingredient.id, { unitId: unit.id });
		const garnishLine = (ingredientId: string, quantity = 1) => ({
			ingredientId,
			amount: { type: 'exact' as const, quantity, unitId: unit.id },
		});

		beforeEach(async () => {
			const [category] = await categoriesRepository.findAll({});
			mint = await ingredientsRepository.create({
				translations: { en: { name: 'Mint' }, pt: { name: 'Hortelã' } },
				category,
				units: [unit],
			});
		});

		it('should be able to replace the garnishes of a drink', async () => {
			await service.execute({
				id: createdDrink.id,
				translations: updatedTranslations,
				ingredients: [mainLine()],
				garnishes: [garnishLine(mint.id, 3)],
			});

			const updated = (await drinksRepository.findById(createdDrink.id)) as Drink;

			expect(updated.garnishes).toHaveLength(1);
			expect(updated.garnishes[0].ingredient.id).toBe(mint.id);
			expect(updated.garnishes[0].amount).toEqual({ type: 'exact', quantity: 3, unit });
		});

		it('should be able to remove every garnish with an empty list', async () => {
			await drinksRepository.update({
				id: createdDrink.id,
				garnishes: [createDrinkIngredientFactory(mint, { quantity: 1 })],
			});

			await service.execute({
				id: createdDrink.id,
				translations: updatedTranslations,
				ingredients: [mainLine()],
				garnishes: [],
			});

			const updated = (await drinksRepository.findById(createdDrink.id)) as Drink;

			expect(updated.garnishes).toEqual([]);
		});

		it('should be able to use the same ingredient as an ingredient and as a garnish', async () => {
			await service.execute({
				id: createdDrink.id,
				translations: updatedTranslations,
				ingredients: [mainLine()],
				garnishes: [garnishLine(ingredient.id)],
			});

			const updated = (await drinksRepository.findById(createdDrink.id)) as Drink;

			expect(updated.garnishes[0].ingredient.id).toBe(ingredient.id);
		});

		it('should not be able to update a drink with a nonexistent garnish ingredient', async () => {
			await expect(
				service.execute({
					id: createdDrink.id,
					translations: updatedTranslations,
					ingredients: [mainLine()],
					garnishes: [garnishLine(new ObjectId().toString())],
				}),
			).rejects.toBeInstanceOf(BadRequestError);
		});

		it.each([
			{
				title: 'an ingredient repeats with the same unit',
				build: () => ({ ingredients: [mainLine(), mainLine()], garnishes: [] }),
			},
			{
				title: 'a garnish repeats with the same unit',
				build: () => ({
					ingredients: [mainLine()],
					garnishes: [garnishLine(mint.id), garnishLine(mint.id, 2)],
				}),
			},
			{
				title: 'every ingredient is optional',
				build: () => ({ ingredients: [{ ...mainLine(), optional: true }], garnishes: [] }),
			},
		])('should not update the drink when $title, even when called directly', async ({ build }) => {
			await expect(
				service.execute({ id: createdDrink.id, translations: updatedTranslations, ...build() }),
			).rejects.toBeInstanceOf(BadRequestError);

			const untouched = (await drinksRepository.findById(createdDrink.id)) as Drink;
			expect(untouched.translations).toEqual(translations);
		});
	});
});
