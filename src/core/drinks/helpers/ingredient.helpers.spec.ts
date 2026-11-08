import { describe, expect, it } from 'vitest';
import { BadRequestError } from '@/shared/error/error.lib';
import { assertIngredientBrand, getIngredientBrandIssue } from './ingredient.helpers';

const requiredBrand = 'apiResponses.ingredients.requiredBrand';
const brandNotAllowed = 'apiResponses.ingredients.brandNotAllowed';

describe('getIngredientBrandIssue', () => {
	it.each([
		{ kind: 'branded', brand: 'Licor 43', expected: undefined },
		{ kind: 'generic', brand: undefined, expected: undefined },
		{ kind: 'generic', brand: null, expected: undefined },
		{ kind: undefined, brand: undefined, expected: undefined },
		{ kind: undefined, brand: null, expected: undefined },
		{ kind: 'branded', brand: undefined, expected: requiredBrand },
		{ kind: 'branded', brand: null, expected: requiredBrand },
		{ kind: 'generic', brand: 'Bols', expected: brandNotAllowed },
		{ kind: undefined, brand: 'Bols', expected: brandNotAllowed },
	])('returns $expected for kind $kind and brand $brand', ({ kind, brand, expected }) => {
		expect(getIngredientBrandIssue(kind, brand)).toBe(expected);
	});
});

describe('assertIngredientBrand', () => {
	it('accepts a branded ingredient with a brand and a generic one without', () => {
		expect(() => assertIngredientBrand('branded', 'Licor 43', 'test')).not.toThrow();
		expect(() => assertIngredientBrand('generic', undefined, 'test')).not.toThrow();
	});

	it.each([
		{ title: 'a branded ingredient has no brand', kind: 'branded', brand: undefined, message: requiredBrand },
		{ title: 'a branded ingredient has a null brand', kind: 'branded', brand: null, message: requiredBrand },
		{ title: 'a generic ingredient has a brand', kind: 'generic', brand: 'Bols', message: brandNotAllowed },
	])('throws a BadRequestError when $title', ({ kind, brand, message }) => {
		expect(() => assertIngredientBrand(kind, brand, 'test')).toThrow(BadRequestError);
		expect(() => assertIngredientBrand(kind, brand, 'test')).toThrow(message);
	});
});
