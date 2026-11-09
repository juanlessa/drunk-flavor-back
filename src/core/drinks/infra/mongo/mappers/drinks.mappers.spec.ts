import { describe, expect, it } from 'vitest';
import { PreparationPlan } from '@/core/drinks/modules/preparation';
import { Types } from 'mongoose';
import { CategoryPersistence } from '../entities/category.model';
import { DrinkPersistence } from '../entities/drink.model';
import { IngredientPersistence } from '../entities/ingredient.model';
import { UnitPersistence } from '../entities/unit.model';
import { CategoryMapper } from './category.mapper';
import { DrinkMapper } from './drink.mapper';
import { IngredientMapper } from './ingredient.mapper';
import { UnitMapper } from './unit.mapper';

const createdAt = new Date('2024-01-01T00:00:00.000Z');
const updatedAt = new Date('2024-01-02T00:00:00.000Z');

const buildCategoryPersistence = (): CategoryPersistence => ({
	_id: new Types.ObjectId(),
	translations: { en: { name: 'Syrup' }, pt: { name: 'Xarope' } },
	is_alcoholic: false,
	created_at: createdAt,
	updated_at: updatedAt,
});

const buildUnitPersistence = (): UnitPersistence => ({
	_id: new Types.ObjectId(),
	translations: {
		en: { name: 'milliliter', name_plural: 'milliliters' },
		pt: { name: 'mililitro', name_plural: 'mililitros' },
	},
	symbol: 'ml',
	space_before_symbol: false,
	allow_decimal: true,
	kind: 'volume',
	created_at: createdAt,
	updated_at: updatedAt,
});

const buildIngredientPersistence = (): IngredientPersistence => ({
	_id: new Types.ObjectId(),
	translations: { en: { name: 'Lime' }, pt: { name: 'Limão' } },
	category: buildCategoryPersistence(),
	units: [buildUnitPersistence()],
	kind: 'generic',
	created_at: createdAt,
	updated_at: updatedAt,
});

const buildDrinkPersistence = (): DrinkPersistence => {
	const ingredient = buildIngredientPersistence();
	return {
		_id: new Types.ObjectId(),
		translations: {
			en: { name: 'Caipirinha', method: 'Muddle and stir' },
			pt: { name: 'Caipirinha', method: 'Macere e mexa' },
		},
		ingredients: [
			{
				ingredient,
				amount: { type: 'exact', quantity: 60, unit: ingredient.units[0] },
				optional: false,
			},
		],
		garnishes: [{ ingredient, amount: { type: 'none' } }],
		avg_rating: 4,
		ratings_count: 2,
		ratings_sum: 8,
		created_at: createdAt,
		updated_at: updatedAt,
	};
};

describe('Drink domain persistence mappers', () => {
	it('maps categories between camelCase domain and snake_case persistence data', () => {
		const persistence = buildCategoryPersistence();
		const category = CategoryMapper.toDomain({ ...persistence, __v: 1 } as CategoryPersistence);

		expect(category).toEqual({
			id: persistence._id.toHexString(),
			translations: persistence.translations,
			isAlcoholic: false,
			createdAt,
			updatedAt,
		});
		expect(category).not.toHaveProperty('__v');

		const mapped = CategoryMapper.toPersistence(category);
		expect(mapped._id).toBeInstanceOf(Types.ObjectId);
		expect(mapped).toMatchObject({ is_alcoholic: false, created_at: createdAt, updated_at: updatedAt });
		expect(mapped).not.toHaveProperty('isAlcoholic');
	});

	it('maps units between camelCase domain and nested snake_case persistence data', () => {
		const persistence = buildUnitPersistence();
		const unit = UnitMapper.toDomain({ ...persistence, __v: 1 } as UnitPersistence);

		expect(unit).toMatchObject({
			id: persistence._id.toHexString(),
			translations: {
				en: { name: 'milliliter', namePlural: 'milliliters' },
				pt: { name: 'mililitro', namePlural: 'mililitros' },
			},
			spaceBeforeSymbol: false,
			allowDecimal: true,
		});
		expect(unit).not.toHaveProperty('__v');

		const mapped = UnitMapper.toPersistence(unit);
		expect(mapped).toMatchObject({
			translations: {
				en: { name: 'milliliter', name_plural: 'milliliters' },
				pt: { name: 'mililitro', name_plural: 'mililitros' },
			},
			space_before_symbol: false,
			allow_decimal: true,
		});
		expect(mapped).not.toHaveProperty('spaceBeforeSymbol');
		expect(mapped).not.toHaveProperty('allowDecimal');
	});

	it('maps embedded category and unit identities through the ingredient boundary', () => {
		const persistence = buildIngredientPersistence();
		const ingredient = IngredientMapper.toDomain({ ...persistence, __v: 1 } as IngredientPersistence);

		expect(ingredient).toMatchObject({
			id: persistence._id.toHexString(),
			category: {
				id: persistence.category._id.toHexString(),
				isAlcoholic: false,
			},
			units: [
				{
					id: persistence.units[0]._id.toHexString(),
					spaceBeforeSymbol: false,
					allowDecimal: true,
				},
			],
		});
		expect(ingredient).not.toHaveProperty('__v');
		expect(ingredient.category).not.toHaveProperty('_id');
		expect(ingredient.units[0]).not.toHaveProperty('_id');

		const mapped = IngredientMapper.toPersistence(ingredient);
		expect(mapped.category?._id).toBeInstanceOf(Types.ObjectId);
		expect(mapped.category).toMatchObject({ is_alcoholic: false });
		expect(mapped.units?.[0]?._id).toBeInstanceOf(Types.ObjectId);
		expect(mapped.units?.[0]).toMatchObject({
			space_before_symbol: false,
			allow_decimal: true,
		});
	});

	it('maps drink aggregates and deeply embedded entities without leaking Mongo fields', () => {
		const persistence = buildDrinkPersistence();
		const drink = DrinkMapper.toDomain({ ...persistence, __v: 1 } as DrinkPersistence);

		expect(drink).toMatchObject({
			id: persistence._id.toHexString(),
			avgRating: 4,
			ratingsCount: 2,
			ingredients: [
				{
					optional: false,
					amount: { type: 'exact', quantity: 60, unit: { allowDecimal: true } },
					ingredient: {
						id: persistence.ingredients[0].ingredient._id.toHexString(),
						category: { isAlcoholic: false },
						units: [{ allowDecimal: true }],
					},
				},
			],
		});
		expect(drink).not.toHaveProperty('__v');
		expect(drink).not.toHaveProperty('avg_rating');
		expect(drink).not.toHaveProperty('ratingsSum');
		expect(drink).not.toHaveProperty('ratings_sum');

		const mapped = DrinkMapper.toPersistence(drink);
		expect(mapped._id).toBeInstanceOf(Types.ObjectId);
		expect(mapped.ingredients?.[0]?.ingredient._id).toBeInstanceOf(Types.ObjectId);
		expect(mapped).toMatchObject({
			avg_rating: 4,
			ratings_count: 2,
			ingredients: [
				{
					optional: false,
					amount: { type: 'exact', quantity: 60, unit: { allow_decimal: true } },
					ingredient: {
						category: { is_alcoholic: false },
						units: [{ allow_decimal: true }],
					},
				},
			],
		});
		expect(mapped).not.toHaveProperty('avgRating');
	});

	it('drops the fields only the persistence layer knows, even when the query loaded them', () => {
		// An aggregation returns the fields marked `select: false`, unlike a find.
		const loaded = {
			...buildDrinkPersistence(),
			ratings_sum: 8,
			search_keys: ['negroni'],
			required_ingredient_ids: [new Types.ObjectId()],
		} as DrinkPersistence;

		const drink = DrinkMapper.toDomain(loaded);

		expect(drink).toMatchObject({ avgRating: 4, ratingsCount: 2 });
		for (const field of ['ratingsSum', 'ratings_sum', 'searchKeys', 'search_keys', 'requiredIngredientIds']) {
			expect(drink).not.toHaveProperty(field);
		}
	});
	it('maps domain query fields to persistence field names for every drinks aggregate', () => {
		expect(
			CategoryMapper.toPersistenceQuery({ search: { isAlcoholic: 'false' }, sort: { createdAt: -1 } }),
		).toEqual({
			search: { is_alcoholic: 'false' },
			sort: { created_at: -1 },
		});
		expect(UnitMapper.toPersistenceQuery({ search: { allowDecimal: 'true' }, sort: { updatedAt: 1 } })).toEqual({
			search: { allow_decimal: 'true' },
			sort: { updated_at: 1 },
		});
		expect(IngredientMapper.toPersistenceQuery({ sort: { 'category.createdAt': -1 } })).toEqual({
			sort: { 'category.created_at': -1 },
		});
		expect(DrinkMapper.toPersistenceQuery({ search: { avgRating: '4' }, sort: { ratingsCount: -1 } })).toEqual({
			search: { avg_rating: '4' },
			sort: { ratings_count: -1 },
		});
	});
	it('maps the keys of a preparation plan at any depth in both directions', () => {
		const plan: PreparationPlan = {
			mixingVessel: 'shaker',
			servingGlass: 'coupe',
			actions: [
				{
					type: 'add',
					target: 'mixing',
					items: [{ list: 'ingredients', ingredientId: 'gin', unitId: 'ml', withUnit: true }],
				},
				{ type: 'strain', kind: 'single', overIce: true },
			],
		};

		const persisted = DrinkMapper.toPersistence({ preparation: plan });
		const drink = DrinkMapper.toDomain({ ...buildDrinkPersistence(), preparation: persisted.preparation });

		expect(persisted.preparation).toEqual({
			mixing_vessel: 'shaker',
			serving_glass: 'coupe',
			actions: [
				{
					type: 'add',
					target: 'mixing',
					items: [{ list: 'ingredients', ingredient_id: 'gin', unit_id: 'ml', with_unit: true }],
				},
				{ type: 'strain', kind: 'single', over_ice: true },
			],
		});
		expect(drink.preparation).toEqual(plan);
	});

	it('leaves the plan out when the drink has none', () => {
		expect(DrinkMapper.toPersistence({ translations: { en: { name: 'Sour' } } })).not.toHaveProperty('preparation');
		expect(DrinkMapper.toDomain(buildDrinkPersistence())).not.toHaveProperty('preparation');
	});
});
