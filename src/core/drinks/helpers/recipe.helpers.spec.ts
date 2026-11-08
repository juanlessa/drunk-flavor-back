import { describe, expect, it } from 'vitest';
import { DrinkGarnish, DrinkIngredient, DrinkIngredientAmount } from '@/core/drinks/entities/drink.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { BadRequestError } from '@/shared/error/error.lib';
import { assertValidRecipe, findDuplicateKeyIndexes, getRecipeItemKey, hasRequiredIngredient } from './recipe.helpers';

const now = new Date();

const buildUnit = (id: string): Unit => ({
	id,
	translations: {
		en: { name: id, namePlural: `${id}s` },
		pt: { name: id, namePlural: `${id}s` },
	},
	allowDecimal: true,
	kind: 'volume',
	createdAt: now,
	updatedAt: now,
});

const ml = buildUnit('ml');
const slice = buildUnit('slice');

const buildIngredient = (id: string): Ingredient => ({
	id,
	translations: { en: { name: id }, pt: { name: id } },
	category: {
		id: 'category',
		translations: { en: { name: 'Fruit' }, pt: { name: 'Fruta' } },
		isAlcoholic: false,
		createdAt: now,
		updatedAt: now,
	},
	units: [ml, slice],
	kind: 'generic',
	createdAt: now,
	updatedAt: now,
});

const lime = buildIngredient('lime');
const mint = buildIngredient('mint');

const exact = (unit: Unit): DrinkIngredientAmount => ({ type: 'exact', quantity: 1, unit });
const none: DrinkIngredientAmount = { type: 'none' };
const toTaste: DrinkIngredientAmount = { type: 'qualitative', qualifier: 'to_taste' };
const topUpHint = (unit: Unit): DrinkIngredientAmount => ({
	type: 'qualitative',
	qualifier: 'top_up',
	quantity: 100,
	unit,
});

const ingredientLine = (ingredient: Ingredient, amount: DrinkIngredientAmount, optional = false): DrinkIngredient => ({
	ingredient,
	amount,
	optional,
});
const garnishLine = (ingredient: Ingredient, amount: DrinkIngredientAmount): DrinkGarnish => ({ ingredient, amount });

describe('getRecipeItemKey', () => {
	it('combines the ingredient with the unit it is measured in', () => {
		expect(getRecipeItemKey('lime', 'ml')).not.toBe(getRecipeItemKey('lime', 'slice'));
		expect(getRecipeItemKey('lime', 'ml')).not.toBe(getRecipeItemKey('mint', 'ml'));
		expect(getRecipeItemKey('lime', 'ml')).toBe(getRecipeItemKey('lime', 'ml'));
	});

	it('gives every line without a unit the same slot per ingredient', () => {
		expect(getRecipeItemKey('lime')).toBe(getRecipeItemKey('lime', undefined));
		expect(getRecipeItemKey('lime')).not.toBe(getRecipeItemKey('mint'));
		expect(getRecipeItemKey('lime')).not.toBe(getRecipeItemKey('lime', 'ml'));
	});
});

describe('findDuplicateKeyIndexes', () => {
	it.each([
		{ keys: [], expected: [] },
		{ keys: ['a', 'b', 'c'], expected: [] },
		{ keys: ['a', 'b', 'a'], expected: [2] },
		{ keys: ['a', 'a', 'b', 'a'], expected: [1, 3] },
	])('returns $expected for $keys', ({ keys, expected }) => {
		expect(findDuplicateKeyIndexes(keys)).toEqual(expected);
	});
});

describe('hasRequiredIngredient', () => {
	it('is true when at least one ingredient is not optional', () => {
		expect(hasRequiredIngredient([{ optional: true }, { optional: false }])).toBe(true);
	});

	it.each([
		{ title: 'there are no ingredients', ingredients: [] },
		{ title: 'every ingredient is optional', ingredients: [{ optional: true }, { optional: true }] },
	])('is false when $title', ({ ingredients }) => {
		expect(hasRequiredIngredient(ingredients)).toBe(false);
	});
});

describe('assertValidRecipe', () => {
	const path = 'test';

	it('accepts a recipe without garnishes', () => {
		expect(() => assertValidRecipe([ingredientLine(lime, exact(ml))], [], path)).not.toThrow();
	});

	it('accepts the same ingredient with different units in a list', () => {
		expect(() =>
			assertValidRecipe([ingredientLine(lime, exact(ml)), ingredientLine(lime, exact(slice))], [], path),
		).not.toThrow();
	});

	it('accepts a unitless line next to lines with units of the same ingredient', () => {
		expect(() =>
			assertValidRecipe([ingredientLine(lime, exact(ml)), ingredientLine(lime, none)], [], path),
		).not.toThrow();
	});

	it('accepts the same ingredient as an ingredient and as a garnish', () => {
		expect(() =>
			assertValidRecipe([ingredientLine(mint, exact(ml))], [garnishLine(mint, exact(ml))], path),
		).not.toThrow();
	});

	it('accepts an optional ingredient as long as another one is required', () => {
		expect(() =>
			assertValidRecipe([ingredientLine(lime, exact(ml)), ingredientLine(mint, none, true)], [], path),
		).not.toThrow();
	});

	it.each([
		{ title: 'there are no ingredients', ingredients: [] as DrinkIngredient[] },
		{ title: 'every ingredient is optional', ingredients: [ingredientLine(lime, exact(ml), true)] },
	])('rejects a recipe when $title', ({ ingredients }) => {
		expect(() => assertValidRecipe(ingredients, [], path)).toThrow(BadRequestError);
		expect(() => assertValidRecipe(ingredients, [], path)).toThrow('apiResponses.drinks.requiredMainIngredient');
	});

	it.each([
		{
			title: 'the same ingredient repeats with the same unit',
			ingredients: [ingredientLine(lime, exact(ml)), ingredientLine(lime, exact(ml))],
		},
		{
			title: 'an exact amount and a qualitative hint share the same unit',
			ingredients: [ingredientLine(lime, exact(ml)), ingredientLine(lime, topUpHint(ml))],
		},
		{
			title: 'a none amount and a unitless qualitative share the no-unit slot',
			ingredients: [ingredientLine(lime, exact(ml)), ingredientLine(lime, none), ingredientLine(lime, toTaste)],
		},
		{
			title: 'the no-unit slot is used twice',
			ingredients: [ingredientLine(lime, exact(ml)), ingredientLine(mint, none), ingredientLine(mint, none)],
		},
	])('rejects the ingredients list when $title', ({ ingredients }) => {
		expect(() => assertValidRecipe(ingredients, [], path)).toThrow(BadRequestError);
		expect(() => assertValidRecipe(ingredients, [], path)).toThrow('apiResponses.drinks.duplicateIngredientUnit');
	});

	it('rejects a duplicated line inside the garnishes', () => {
		const garnishes = [garnishLine(lime, exact(slice)), garnishLine(lime, exact(slice))];

		expect(() => assertValidRecipe([ingredientLine(mint, exact(ml))], garnishes, path)).toThrow(
			'apiResponses.drinks.duplicateIngredientUnit',
		);
	});

	it('reports the given path on the error', () => {
		const run = () => assertValidRecipe([], [], 'CreateDrink.service');

		expect(run).toThrow(expect.objectContaining({ path: 'CreateDrink.service' }));
	});
});
