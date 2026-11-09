import { ObjectId } from 'mongodb';
import { withCreator } from '@/core/drinks/factories/authorship.factories';
import { beforeEach, describe, expect, it } from 'vitest';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createDrinkIngredientInputFactory } from '@/core/drinks/factories/drink.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { PreparationPlan } from '@/core/drinks/modules/preparation';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { BadRequestError, FieldValidationError } from '@/shared/error/error.lib';
import { GenerateMethodService } from './GenerateMethod.service';

let ingredientsRepository: IngredientsRepositoryInMemory;
let service: GenerateMethodService;
let ingredient: Ingredient;
let unit: Unit;

const buildPlan = (actions: PreparationPlan['actions']): PreparationPlan => ({
	mixingVessel: 'serving_glass',
	servingGlass: 'rocks',
	actions,
});
const addIngredient = (): PreparationPlan['actions'][number] => ({
	type: 'add',
	target: 'mixing',
	items: [{ list: 'ingredients', ingredientId: ingredient.id, unitId: unit.id }],
});

describe('Generate Method', () => {
	beforeEach(async () => {
		const categoriesRepository = new CategoriesRepositoryInMemory();
		const unitsRepository = new UnitsRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		service = new GenerateMethodService(ingredientsRepository);

		const category = await categoriesRepository.create(
			withCreator({
				translations: createCategoryFactory().translations,
				isAlcoholic: false,
			}),
		);
		unit = await unitsRepository.create(createUnitFactory());
		ingredient = await ingredientsRepository.create(
			withCreator({
				translations: createIngredientFactory().translations,
				category,
				units: [unit],
			}),
		);
	});

	it('should write the method in every language, sentence by sentence, without saving anything', async () => {
		const result = await service.execute({
			ingredients: [createDrinkIngredientInputFactory(ingredient.id, { unitId: unit.id })],
			preparation: buildPlan([addIngredient()]),
		});

		expect(result.method).toEqual({
			en: 'In a rocks glass, add syrup.',
			pt: 'Em um copo baixo, adicione o xarope.',
		});
		expect(result.sentences).toEqual({
			en: ['In a rocks glass, add syrup.'],
			pt: ['Em um copo baixo, adicione o xarope.'],
		});
		expect(result.warnings).toEqual([]);
	});

	it('should report the unusual choices of the plan as warnings and still write the method', async () => {
		const result = await service.execute({
			ingredients: [createDrinkIngredientInputFactory(ingredient.id, { unitId: unit.id })],
			preparation: buildPlan([addIngredient(), { type: 'prepare_glass', mode: 'chill' }]),
		});

		expect(result.method.en).not.toBe('');
		expect(result.warnings).toEqual([
			{
				location: 'body',
				path: 'preparation.actions.1',
				localeKey: 'apiResponses.drinks.preparation.glassPreparedLate',
			},
		]);
	});

	it('should not write a method for a plan that does not fit the recipe', async () => {
		await expect(
			service.execute({
				ingredients: [createDrinkIngredientInputFactory(ingredient.id, { unitId: unit.id })],
				preparation: buildPlan([{ type: 'prepare_glass', mode: 'chill' }]),
			}),
		).rejects.toBeInstanceOf(FieldValidationError);
	});

	it('should not be able to write a method for a recipe with a nonexistent ingredient', async () => {
		await expect(
			service.execute({
				ingredients: [createDrinkIngredientInputFactory(new ObjectId().toString(), { unitId: unit.id })],
				preparation: buildPlan([addIngredient()]),
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
