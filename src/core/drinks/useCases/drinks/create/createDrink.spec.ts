import { Category } from '@/core/drinks/entities/category.entity';
import { withActor, withCreator } from '@/core/drinks/factories/authorship.factories';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateDrinkService } from './CreateDrink.service';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { ConflictError, BadRequestError, FieldValidationError } from '@/shared/error/error.lib';
import { PreparationPlan } from '@/core/drinks/modules/preparation';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import {
	createDrinkFactory,
	createDrinkIngredientFactory,
	createDrinkIngredientInputFactory,
} from '@/core/drinks/factories/drink.factories';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { Drink } from '@/core/drinks/entities/drink.entity';

let categoriesRepository: ICategoriesRepository;
let ingredientsRepository: IIngredientsRepository;
let unitsRepository: IUnitsRepository;
let drinksRepository: IDrinksRepository;
let service: CreateDrinkService;

const { translations: categoryTranslations } = createCategoryFactory();
let createdCategory: Category;
let createdUnit: Unit;
const { translations: ingredientTranslations } = createIngredientFactory();
let createdIngredient: Ingredient;
const { translations } = createDrinkFactory();

describe('Create Drink', () => {
	beforeEach(async () => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		unitsRepository = new UnitsRepositoryInMemory();
		drinksRepository = new DrinksRepositoryInMemory();
		service = new CreateDrinkService(drinksRepository, ingredientsRepository);

		createdCategory = await categoriesRepository.create(
			withCreator({
				translations: categoryTranslations,
				isAlcoholic: false,
			}),
		);
		createdUnit = await unitsRepository.create(createUnitFactory());
		createdIngredient = await ingredientsRepository.create(
			withCreator({
				translations: ingredientTranslations,
				category: createdCategory,
				units: [createdUnit],
			}),
		);
	});

	it('should be able to create a new Drink', async () => {
		const id = await service.execute(
			withActor({
				translations,
				ingredients: [createDrinkIngredientInputFactory(createdIngredient.id, { unitId: createdUnit.id })],
			}),
		);

		const created = (await drinksRepository.findByName(translations)) as Drink;

		expect(created).toHaveProperty('id');
		expect(created.translations).toEqual(translations);
		expect(created.ingredients.length).toEqual(1);
		expect(id).toEqual(created.id);
	});

	it('should snapshot the chosen unit into the drink ingredient amount', async () => {
		await service.execute(
			withActor({
				translations,
				ingredients: [createDrinkIngredientInputFactory(createdIngredient.id, { unitId: createdUnit.id })],
			}),
		);

		const created = (await drinksRepository.findByName(translations)) as Drink;
		const [line] = created.ingredients;

		expect(line.amount).toEqual({ type: 'exact', quantity: 60, unit: createdUnit });
		expect(line.optional).toBe(false);
	});

	it('should initialize the Drink aggregate fields to zero', async () => {
		await service.execute(
			withActor({
				translations,
				ingredients: [createDrinkIngredientInputFactory(createdIngredient.id, { unitId: createdUnit.id })],
			}),
		);

		const created = (await drinksRepository.findByName(translations)) as Drink;

		expect(created.avgRating).toBe(0);
		expect(created.ratingsCount).toBe(0);
	});

	it('should not be able to create an exact amount with a unit not allowed by the ingredient', async () => {
		await expect(
			service.execute(
				withActor({
					translations,
					ingredients: [
						createDrinkIngredientInputFactory(createdIngredient.id, { unitId: new ObjectId().toString() }),
					],
				}),
			),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to create a drink with an existing name', async () => {
		await drinksRepository.create(
			withCreator({
				translations,
				ingredients: [createDrinkIngredientFactory(createdIngredient)],
			}),
		);

		await expect(
			service.execute(
				withActor({
					translations,
					ingredients: [createDrinkIngredientInputFactory(createdIngredient.id, { unitId: createdUnit.id })],
				}),
			),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('should not be able to create a drink with a nonexistent ingredient', async () => {
		await expect(
			service.execute(
				withActor({
					translations,
					ingredients: [
						createDrinkIngredientInputFactory(new ObjectId().toString(), { unitId: createdUnit.id }),
					],
				}),
			),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	describe('garnishes and amounts', () => {
		let mint: Ingredient;
		let foam: Ingredient;

		const exactLine = (ingredientId: string, unitId: string, quantity = 1) => ({
			ingredientId,
			amount: { type: 'exact' as const, quantity, unitId },
		});

		beforeEach(async () => {
			mint = await ingredientsRepository.create(
				withCreator({
					translations: { en: { name: 'Mint' }, pt: { name: 'Hortelã' } },
					category: createdCategory,
					units: [createdUnit],
				}),
			);
			foam = await ingredientsRepository.create(
				withCreator({
					translations: { en: { name: 'Ginger foam' }, pt: { name: 'Espuma de gengibre' } },
					category: createdCategory,
					units: [],
				}),
			);
		});

		const mainLine = () => createDrinkIngredientInputFactory(createdIngredient.id, { unitId: createdUnit.id });

		it('should be able to create a drink with garnishes', async () => {
			await service.execute(
				withActor({
					translations,
					ingredients: [mainLine()],
					garnishes: [exactLine(mint.id, createdUnit.id, 2)],
				}),
			);

			const created = (await drinksRepository.findByName(translations)) as Drink;

			expect(created.ingredients).toHaveLength(1);
			expect(created.garnishes).toHaveLength(1);
			expect(created.garnishes[0].ingredient.id).toBe(mint.id);
			expect(created.garnishes[0].amount).toEqual({ type: 'exact', quantity: 2, unit: createdUnit });
			expect(created.garnishes[0]).not.toHaveProperty('optional');
		});

		it('should create a drink without garnishes when none are given', async () => {
			await service.execute(withActor({ translations, ingredients: [mainLine()] }));

			const created = (await drinksRepository.findByName(translations)) as Drink;

			expect(created.garnishes).toEqual([]);
		});

		it('should be able to use the same ingredient as an ingredient and as a garnish', async () => {
			await service.execute(
				withActor({
					translations,
					ingredients: [mainLine()],
					garnishes: [exactLine(createdIngredient.id, createdUnit.id)],
				}),
			);

			const created = (await drinksRepository.findByName(translations)) as Drink;

			expect(created.ingredients[0].ingredient.id).toBe(createdIngredient.id);
			expect(created.garnishes[0].ingredient.id).toBe(createdIngredient.id);
		});

		it('should be able to create a drink with qualitative, none and optional amounts', async () => {
			await service.execute(
				withActor({
					translations,
					ingredients: [
						mainLine(),
						{
							ingredientId: mint.id,
							amount: { type: 'qualitative', qualifier: 'top_up', quantity: 120, unitId: createdUnit.id },
							optional: false,
						},
						{ ingredientId: foam.id, amount: { type: 'none' }, optional: true },
					],
				}),
			);

			const created = (await drinksRepository.findByName(translations)) as Drink;

			expect(created.ingredients.map(({ amount }) => amount.type)).toEqual(['exact', 'qualitative', 'none']);
			expect(created.ingredients[1].amount).toEqual({
				type: 'qualitative',
				qualifier: 'top_up',
				quantity: 120,
				unit: createdUnit,
			});
			expect(created.ingredients[2].optional).toBe(true);
		});

		it('should not be able to create a drink with a nonexistent garnish ingredient', async () => {
			await expect(
				service.execute(
					withActor({
						translations,
						ingredients: [mainLine()],
						garnishes: [exactLine(new ObjectId().toString(), createdUnit.id)],
					}),
				),
			).rejects.toBeInstanceOf(BadRequestError);
		});

		it('should not be able to create a not measurable ingredient with an exact amount', async () => {
			await expect(
				service.execute(
					withActor({
						translations,
						ingredients: [mainLine(), { ...exactLine(foam.id, createdUnit.id), optional: false }],
					}),
				),
			).rejects.toBeInstanceOf(BadRequestError);
		});

		it.each([
			{
				title: 'an ingredient repeats with the same unit',
				build: () => ({ ingredients: [mainLine(), mainLine()], garnishes: [] }),
			},
			{
				title: 'every ingredient is optional',
				build: () => ({ ingredients: [{ ...mainLine(), optional: true }], garnishes: [] }),
			},
		])('should not be able to create a drink when $title, even when called directly', async ({ build }) => {
			await expect(service.execute(withActor({ translations, ...build() }))).rejects.toBeInstanceOf(
				BadRequestError,
			);
			expect(await drinksRepository.findByName(translations)).toBeNull();
		});
	});

	describe('preparation', () => {
		const buildPlan = (): PreparationPlan => ({
			mixingVessel: 'serving_glass',
			servingGlass: 'rocks',
			actions: [
				{
					type: 'add',
					target: 'mixing',
					items: [{ list: 'ingredients', ingredientId: createdIngredient.id, unitId: createdUnit.id }],
				},
			],
		});

		const manualTranslations = {
			en: { name: 'Hand made', method: 'Made by hand.' },
			pt: { name: 'Feito a mão', method: 'Feito à mão.' },
		};
		const namesOnly = { en: { name: 'Planned' }, pt: { name: 'Planejado' } };
		const line = () => createDrinkIngredientInputFactory(createdIngredient.id, { unitId: createdUnit.id });

		it('should write the method of both languages from the plan and store the plan', async () => {
			const preparation = buildPlan();

			const id = await service.execute(
				withActor({ translations: namesOnly, ingredients: [line()], preparation }),
			);

			const created = (await drinksRepository.findById(id)) as Drink;
			expect(created.translations.en).toEqual({ name: 'Planned', method: 'In a rocks glass, add syrup.' });
			expect(created.translations.pt).toEqual({
				name: 'Planejado',
				method: 'Em um copo baixo, adicione o xarope.',
			});
			expect(created.preparation).toEqual(preparation);
		});

		it('should store only the method when there is no plan', async () => {
			const id = await service.execute(withActor({ translations: manualTranslations, ingredients: [line()] }));

			const created = (await drinksRepository.findById(id)) as Drink;
			expect(created.translations).toEqual(manualTranslations);
			expect(created.preparation).toBeUndefined();
		});

		it('should not create the drink when the plan does not fit the recipe', async () => {
			const preparation: PreparationPlan = {
				mixingVessel: 'serving_glass',
				servingGlass: 'rocks',
				actions: [{ type: 'prepare_glass', mode: 'chill' }],
			};

			await expect(
				service.execute(withActor({ translations: namesOnly, ingredients: [line()], preparation })),
			).rejects.toBeInstanceOf(FieldValidationError);
			expect(await drinksRepository.findByName(namesOnly)).toBeNull();
		});
	});
});
