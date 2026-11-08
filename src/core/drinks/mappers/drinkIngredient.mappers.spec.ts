import { describe, expect, it } from 'vitest';
import { DrinkGarnishInput, DrinkIngredientInput } from '@/core/drinks/dtos/drink.dtos';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { BadRequestError } from '@/shared/error/error.lib';
import { mapDrinkGarnishes, mapDrinkIngredients } from './drinkIngredient.mappers';

const now = new Date();

const buildUnit = (id: string, kind: Unit['kind'] = 'volume'): Unit => ({
	id,
	translations: {
		en: { name: id, namePlural: `${id}s` },
		pt: { name: id, namePlural: `${id}s` },
	},
	allowDecimal: kind === 'volume',
	kind,
	createdAt: now,
	updatedAt: now,
});

const ml = buildUnit('ml');
const slice = buildUnit('slice', 'count');
const wedge = buildUnit('wedge', 'count');

const buildIngredient = (id: string, units: Unit[]): Ingredient => ({
	id,
	translations: { en: { name: id }, pt: { name: id } },
	category: {
		id: 'category',
		translations: { en: { name: 'Fruit' }, pt: { name: 'Fruta' } },
		isAlcoholic: false,
		createdAt: now,
		updatedAt: now,
	},
	units,
	kind: 'generic',
	createdAt: now,
	updatedAt: now,
});

const lime = buildIngredient('lime', [slice, wedge]);
const rum = buildIngredient('rum', [ml]);
const foam = buildIngredient('foam', []);
const ingredientsById = { lime, rum, foam };

const ingredientInput = (
	ingredientId: string,
	amount: DrinkIngredientInput['amount'],
	optional = false,
): DrinkIngredientInput => ({ ingredientId, amount, optional });

describe('mapDrinkIngredients', () => {
	it('snapshots the ingredient and the chosen unit for an exact amount', () => {
		const [line] = mapDrinkIngredients(
			[ingredientInput('lime', { type: 'exact', quantity: 2, unitId: 'wedge' })],
			ingredientsById,
		);

		expect(line.ingredient).toBe(lime);
		expect(line.amount).toEqual({ type: 'exact', quantity: 2, unit: wedge });
		expect(line.optional).toBe(false);
	});

	it('keeps the optional flag of each line', () => {
		const lines = mapDrinkIngredients(
			[
				ingredientInput('rum', { type: 'exact', quantity: 50, unitId: 'ml' }),
				ingredientInput('foam', { type: 'none' }, true),
			],
			ingredientsById,
		);

		expect(lines.map(({ optional }) => optional)).toEqual([false, true]);
	});

	it('maps a qualitative amount without a hint to the qualifier alone', () => {
		const [line] = mapDrinkIngredients(
			[ingredientInput('rum', { type: 'qualitative', qualifier: 'top_up' })],
			ingredientsById,
		);

		expect(line.amount).toStrictEqual({ type: 'qualitative', qualifier: 'top_up' });
	});

	it('maps a qualitative amount with an approximate quantity and its unit snapshot', () => {
		const [line] = mapDrinkIngredients(
			[ingredientInput('rum', { type: 'qualitative', qualifier: 'top_up', quantity: 120, unitId: 'ml' })],
			ingredientsById,
		);

		expect(line.amount).toStrictEqual({ type: 'qualitative', qualifier: 'top_up', quantity: 120, unit: ml });
	});

	it('maps a none amount to the type alone', () => {
		const [line] = mapDrinkIngredients([ingredientInput('foam', { type: 'none' })], ingredientsById);

		expect(line.amount).toStrictEqual({ type: 'none' });
	});

	it('accepts a none or qualitative amount for an ingredient that is not measurable', () => {
		expect(() =>
			mapDrinkIngredients(
				[
					ingredientInput('foam', { type: 'none' }),
					ingredientInput('foam', { type: 'qualitative', qualifier: 'to_taste' }),
				],
				ingredientsById,
			),
		).not.toThrow();
	});

	it.each([
		{
			title: 'an exact amount uses a unit the ingredient does not allow',
			input: ingredientInput('lime', { type: 'exact', quantity: 1, unitId: 'ml' }),
			message: 'apiResponses.drinks.amountUnitNotAllowed',
		},
		{
			title: 'a qualitative hint uses a unit the ingredient does not allow',
			input: ingredientInput('rum', { type: 'qualitative', qualifier: 'top_up', quantity: 5, unitId: 'slice' }),
			message: 'apiResponses.drinks.amountUnitNotAllowed',
		},
		{
			title: 'an exact amount is given to an ingredient that is not measurable',
			input: ingredientInput('foam', { type: 'exact', quantity: 1, unitId: 'ml' }),
			message: 'apiResponses.drinks.amountNotMeasurable',
		},
	])('throws a BadRequestError when $title', ({ input, message }) => {
		expect(() => mapDrinkIngredients([input], ingredientsById)).toThrow(BadRequestError);
		expect(() => mapDrinkIngredients([input], ingredientsById)).toThrow(message);
	});
});

describe('mapDrinkGarnishes', () => {
	const garnishInput = (ingredientId: string, amount: DrinkGarnishInput['amount']): DrinkGarnishInput => ({
		ingredientId,
		amount,
	});

	it('snapshots the ingredient and the unit without an optional flag', () => {
		const [garnish] = mapDrinkGarnishes(
			[garnishInput('lime', { type: 'exact', quantity: 1, unitId: 'slice' })],
			ingredientsById,
		);

		expect(garnish).toStrictEqual({
			ingredient: lime,
			amount: { type: 'exact', quantity: 1, unit: slice },
		});
	});

	it('applies the same unit rules as the ingredients', () => {
		expect(() =>
			mapDrinkGarnishes([garnishInput('lime', { type: 'exact', quantity: 1, unitId: 'ml' })], ingredientsById),
		).toThrow('apiResponses.drinks.amountUnitNotAllowed');
		expect(() =>
			mapDrinkGarnishes([garnishInput('foam', { type: 'exact', quantity: 1, unitId: 'ml' })], ingredientsById),
		).toThrow('apiResponses.drinks.amountNotMeasurable');
	});

	it('returns an empty list when there are no garnishes', () => {
		expect(mapDrinkGarnishes([], ingredientsById)).toEqual([]);
	});
});
