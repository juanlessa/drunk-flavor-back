import { createDrinkSchema } from '@/core/drinks/useCases/drinks/create/createDrink.schema';
import { updateDrinkSchema } from '@/core/drinks/useCases/drinks/update/updateDrink.schema';
import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';

const id = () => new ObjectId().toString();

const translations = {
	en: { name: '  MOJITO  ', method: '  Muddle and stir  ' },
	pt: { name: '  MOJITO  ', method: '  Macere e mexa  ' },
};

const lime = id();
const mint = id();
const ml = id();
const slice = id();

const exact = (ingredientId: string, unitId: string, quantity = 1) => ({
	ingredientId,
	amount: { type: 'exact', quantity, unitId },
});
const none = (ingredientId: string) => ({ ingredientId, amount: { type: 'none' } });
const toTaste = (ingredientId: string) => ({ ingredientId, amount: { type: 'qualitative', qualifier: 'to_taste' } });
const hint = (ingredientId: string, unitId: string) => ({
	ingredientId,
	amount: { type: 'qualitative', qualifier: 'top_up', quantity: 100, unitId },
});

const create = (ingredients: unknown[], garnishes?: unknown[]) =>
	createDrinkSchema.safeParse({ translations, ingredients, ...(garnishes === undefined ? {} : { garnishes }) });

const update = (ingredients: unknown[], garnishes?: unknown[]) =>
	updateDrinkSchema.safeParse({
		id: id(),
		translations,
		ingredients,
		...(garnishes === undefined ? {} : { garnishes }),
	});

/** Where and why the schema rejected the input. */
const issuesOf = (result: ReturnType<typeof create>) =>
	result.success ? [] : result.error.issues.map(({ path, message }) => ({ path, message }));

describe('Drink schemas', () => {
	describe('shape and defaults', () => {
		it('normalizes the translations', () => {
			const result = create([exact(lime, ml)]);

			expect(result.success && result.data.translations.en).toEqual({
				name: 'Mojito',
				method: 'Muddle and stir',
			});
		});

		it('defaults garnishes to an empty list and optional to false on create', () => {
			const result = create([exact(lime, ml)]);

			expect(result.success && result.data.garnishes).toEqual([]);
			expect(result.success && result.data.ingredients[0].optional).toBe(false);
		});

		it('requires the garnishes on update, where the whole recipe is replaced', () => {
			expect(update([exact(lime, ml)]).success).toBe(false);
			expect(update([exact(lime, ml)], []).success).toBe(true);
		});

		it('does not keep an optional flag on garnishes', () => {
			const result = create([exact(lime, ml)], [{ ...none(mint), optional: true }]);

			expect(result.success && result.data.garnishes[0]).not.toHaveProperty('optional');
		});

		it('rejects an ingredient id that is not an object id', () => {
			expect(create([exact('not-an-id', ml)]).success).toBe(false);
			expect(create([exact(lime, 'not-an-id')]).success).toBe(false);
		});
	});

	describe('amount', () => {
		it.each([
			{ title: 'an exact amount', line: exact(lime, ml, 60) },
			{ title: 'a decimal exact amount', line: exact(lime, ml, 2.5) },
			{ title: 'a qualifier alone', line: toTaste(lime) },
			{ title: 'a qualifier with an approximate quantity and unit', line: hint(lime, ml) },
			{ title: 'a none amount', line: none(lime) },
		])('accepts $title', ({ line }) => {
			expect(create([line]).success).toBe(true);
		});

		it.each([
			{ title: 'an unknown amount type', amount: { type: 'plenty' } },
			{ title: 'a missing amount type', amount: { quantity: 1, unitId: ml } },
			{ title: 'an exact amount without a unit', amount: { type: 'exact', quantity: 1 } },
			{ title: 'an exact amount without a quantity', amount: { type: 'exact', unitId: ml } },
			{ title: 'a zero quantity', amount: { type: 'exact', quantity: 0, unitId: ml } },
			{ title: 'a negative quantity', amount: { type: 'exact', quantity: -1, unitId: ml } },
			{ title: 'a qualitative amount without a qualifier', amount: { type: 'qualitative' } },
			{ title: 'an unknown qualifier', amount: { type: 'qualitative', qualifier: 'a_lot' } },
		])('rejects $title', ({ amount }) => {
			expect(create([{ ingredientId: lime, amount }]).success).toBe(false);
		});

		it('requires a unit when a qualitative amount carries a quantity', () => {
			const result = create([
				{ ingredientId: lime, amount: { type: 'qualitative', qualifier: 'top_up', quantity: 100 } },
			]);

			expect(issuesOf(result)).toEqual([
				{ path: ['ingredients', 0, 'amount', 'unitId'], message: 'apiResponses.drinks.requiredAmountUnit' },
			]);
		});

		it('requires a unit for a qualitative quantity in the garnishes too', () => {
			const result = create(
				[exact(lime, ml)],
				[{ ingredientId: mint, amount: { type: 'qualitative', qualifier: 'as_needed', quantity: 2 } }],
			);

			expect(issuesOf(result)).toEqual([
				{ path: ['garnishes', 0, 'amount', 'unitId'], message: 'apiResponses.drinks.requiredAmountUnit' },
			]);
		});
	});

	describe('ingredients', () => {
		it('requires at least one ingredient', () => {
			expect(issuesOf(create([]))).toContainEqual({
				path: ['ingredients'],
				message: 'apiResponses.drinks.requiredIngredients',
			});
		});

		it('requires at least one ingredient that is not optional', () => {
			const result = create([{ ...exact(lime, ml), optional: true }]);

			expect(issuesOf(result)).toEqual([
				{ path: ['ingredients'], message: 'apiResponses.drinks.requiredMainIngredient' },
			]);
		});

		it('accepts optional ingredients next to a required one', () => {
			expect(create([exact(lime, ml), { ...none(mint), optional: true }]).success).toBe(true);
		});

		it('accepts the same ingredient with different units', () => {
			expect(create([exact(lime, ml), exact(lime, slice)]).success).toBe(true);
		});

		it('accepts a unitless line next to lines with units of the same ingredient', () => {
			expect(create([exact(lime, ml), none(lime)]).success).toBe(true);
		});

		it.each([
			{
				title: 'the same unit is used twice',
				ingredients: [exact(lime, ml), exact(lime, ml, 2)],
				index: 1,
			},
			{
				title: 'an exact amount and a qualitative hint share a unit',
				ingredients: [exact(lime, ml), hint(lime, ml)],
				index: 1,
			},
			{
				title: 'two lines have no unit',
				ingredients: [exact(mint, ml), none(lime), none(lime)],
				index: 2,
			},
			{
				title: 'a none amount and a unitless qualitative share the no-unit slot',
				ingredients: [exact(mint, ml), none(lime), toTaste(lime)],
				index: 2,
			},
		])('rejects a repeated ingredient when $title', ({ ingredients, index }) => {
			expect(issuesOf(create(ingredients))).toEqual([
				{
					path: ['ingredients', index, 'ingredientId'],
					message: 'apiResponses.drinks.duplicateIngredientUnit',
				},
			]);
		});
	});

	describe('garnishes', () => {
		it('may be empty', () => {
			expect(create([exact(lime, ml)], []).success).toBe(true);
		});

		it('accepts the same ingredient as an ingredient and as a garnish', () => {
			expect(create([exact(mint, ml)], [exact(mint, ml)]).success).toBe(true);
		});

		it('accepts the same ingredient with different units', () => {
			expect(create([exact(mint, ml)], [exact(lime, slice), exact(lime, ml)]).success).toBe(true);
		});

		it('rejects a repeated unit inside the garnishes', () => {
			const result = create([exact(mint, ml)], [exact(lime, slice), exact(lime, slice, 2)]);

			expect(issuesOf(result)).toEqual([
				{ path: ['garnishes', 1, 'ingredientId'], message: 'apiResponses.drinks.duplicateIngredientUnit' },
			]);
		});
	});

	describe('update', () => {
		it('applies the same rules as create', () => {
			expect(issuesOf(update([exact(lime, ml), exact(lime, ml)], []))).toEqual([
				{ path: ['ingredients', 1, 'ingredientId'], message: 'apiResponses.drinks.duplicateIngredientUnit' },
			]);
			expect(issuesOf(update([{ ...exact(lime, ml), optional: true }], []))).toEqual([
				{ path: ['ingredients'], message: 'apiResponses.drinks.requiredMainIngredient' },
			]);
		});
	});
});
