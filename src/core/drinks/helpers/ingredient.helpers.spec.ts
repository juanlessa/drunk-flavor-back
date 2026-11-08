import { describe, expect, it } from 'vitest';
import { BadRequestError } from '@/shared/error/error.lib';
import {
	assertIngredientBrand,
	assertIngredientNamePlural,
	getIngredientBrandIssue,
	getMissingNamePluralLanguages,
} from './ingredient.helpers';

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

const eachUnit = { useIngredientName: true };
const mlUnit = { useIngredientName: false };
const plainUnit = {};

describe('getMissingNamePluralLanguages', () => {
	it.each([
		{ title: 'no units', units: [] },
		{ title: 'units that are not written with the ingredient name', units: [mlUnit, plainUnit] },
	])('needs no plural name with $title', ({ units }) => {
		expect(getMissingNamePluralLanguages(units, {})).toEqual([]);
	});

	it('needs the plural name of every language while any unit is written with the ingredient name', () => {
		expect(getMissingNamePluralLanguages([mlUnit, eachUnit], {})).toEqual(['en', 'pt']);
	});

	it('lists only the languages that lack it, treating blank and null as missing', () => {
		expect(getMissingNamePluralLanguages([eachUnit], { en: 'Limes', pt: '   ' })).toEqual(['pt']);
		expect(getMissingNamePluralLanguages([eachUnit], { en: null, pt: 'Limões' })).toEqual(['en']);
		expect(getMissingNamePluralLanguages([eachUnit], { en: 'Limes', pt: 'Limões' })).toEqual([]);
	});
});

describe('assertIngredientNamePlural', () => {
	it('accepts an ingredient with the plural names it needs, and one that needs none', () => {
		expect(() => assertIngredientNamePlural([eachUnit], { en: 'Limes', pt: 'Limões' }, 'test')).not.toThrow();
		expect(() => assertIngredientNamePlural([mlUnit], {}, 'test')).not.toThrow();
	});

	it('throws a BadRequestError that points at the first language missing it', () => {
		const assertion = () => assertIngredientNamePlural([eachUnit], { en: 'Limes' }, 'test');
		expect(assertion).toThrow(BadRequestError);
		expect(assertion).toThrow('apiResponses.ingredients.requiredNamePluralForUnit');
	});
});
