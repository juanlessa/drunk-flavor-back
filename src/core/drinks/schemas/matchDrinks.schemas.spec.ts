import { MAX_QUERY_LIMIT } from '@/shared/constants/query.constants';
import { matchDrinksQuerySchema, matchDrinksSchema } from '@/core/drinks/useCases/drinks/match/matchDrinks.schema';
import { MAX_DRINK_MATCH_INGREDIENTS } from '@/core/drinks/constants/drink.constants';
import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';

const id = () => new ObjectId().toString();
const parseBody = (body: unknown) => matchDrinksSchema.safeParse(body);
const parseQuery = (query: unknown) => matchDrinksQuerySchema.safeParse(query);
const issuesOf = (result: ReturnType<typeof parseBody> | ReturnType<typeof parseQuery>) =>
	result.success ? [] : result.error.issues.map(({ path, message }) => ({ path, message }));

describe('Match drinks schemas', () => {
	describe('body: ingredientIds', () => {
		it('accepts a list of ingredient ids', () => {
			const ids = [id(), id()];

			const result = parseBody({ ingredientIds: ids });

			expect(result.success && result.data.ingredientIds).toEqual(ids);
		});

		it('drops the ids that are repeated, keeping the order of the first time each one appears', () => {
			const [first, second] = [id(), id()];

			const result = parseBody({ ingredientIds: [first, second, first, second, first] });

			expect(result.success && result.data.ingredientIds).toEqual([first, second]);
		});

		it('accepts as many ingredients as the limit allows', () => {
			const ids = Array.from({ length: MAX_DRINK_MATCH_INGREDIENTS }, id);

			expect(parseBody({ ingredientIds: ids }).success).toBe(true);
		});

		it.each([
			{ title: 'missing', body: {} },
			{ title: 'not a list', body: { ingredientIds: id() } },
			{ title: 'an empty list', body: { ingredientIds: [] } },
		])('requires at least one ingredient: $title', ({ body }) => {
			expect(issuesOf(parseBody(body))).toEqual([
				{ path: ['ingredientIds'], message: 'apiResponses.drinks.requiredMatchIngredients' },
			]);
		});

		it('rejects more ingredients than the limit allows', () => {
			const ids = Array.from({ length: MAX_DRINK_MATCH_INGREDIENTS + 1 }, id);

			expect(issuesOf(parseBody({ ingredientIds: ids }))).toEqual([
				{ path: ['ingredientIds'], message: 'apiResponses.drinks.tooManyMatchIngredients' },
			]);
		});

		it('points at the id that is not a valid ObjectId', () => {
			expect(issuesOf(parseBody({ ingredientIds: [id(), 'not-an-id'] }))).toEqual([
				{ path: ['ingredientIds', 1], message: 'apiResponses.drinks.invalidIngredientIdFormat' },
			]);
		});

		it('points at the id that is not text', () => {
			expect(issuesOf(parseBody({ ingredientIds: [id(), 42] }))).toEqual([
				{ path: ['ingredientIds', 1], message: 'apiResponses.drinks.requiredIngredientId' },
			]);
		});
	});

	describe('body: maxMissing', () => {
		it('defaults to no missing ingredient', () => {
			const result = parseBody({ ingredientIds: [id()] });

			expect(result.success && result.data.maxMissing).toBe(0);
		});

		it.each([0, 1, 2, 'any'] as const)('accepts %s', (maxMissing) => {
			const result = parseBody({ ingredientIds: [id()], maxMissing });

			expect(result.success && result.data.maxMissing).toBe(maxMissing);
		});

		it.each([
			{ title: 'a number above 2', value: 3 },
			{ title: 'a negative number', value: -1 },
			{ title: 'a fraction', value: 1.5 },
			{ title: 'a number written as text', value: '1' },
			{ title: 'a word that is not "any"', value: 'all' },
			{ title: 'null', value: null },
		])('rejects $title', ({ value }) => {
			expect(issuesOf(parseBody({ ingredientIds: [id()], maxMissing: value }))).toEqual([
				{ path: ['maxMissing'], message: 'apiResponses.drinks.invalidMaxMissing' },
			]);
		});
	});

	describe('query: limit and page', () => {
		it('are optional', () => {
			const result = parseQuery({});

			expect(result.success && result.data).toEqual({});
		});

		it('are read from the text of the URL as numbers', () => {
			const result = parseQuery({ limit: '10', page: '3' });

			expect(result.success && result.data).toEqual({ limit: 10, page: 3 });
		});

		it('accepts the largest limit allowed', () => {
			expect(parseQuery({ limit: String(MAX_QUERY_LIMIT) }).success).toBe(true);
		});

		it.each([
			{ field: 'limit', value: '0' },
			{ field: 'limit', value: String(MAX_QUERY_LIMIT + 1) },
			{ field: 'limit', value: '1.5' },
			{ field: 'limit', value: 'many' },
			{ field: 'page', value: '0' },
			{ field: 'page', value: '-1' },
			{ field: 'page', value: '2.5' },
			{ field: 'page', value: 'first' },
		])('rejects $field $value', ({ field, value }) => {
			expect(parseQuery({ [field]: value }).success).toBe(false);
		});
	});
});
