import { describe, expect, it } from 'vitest';
import { BadRequestError } from '@/shared/error/error.lib';
import { assertUnitIngredientName, getUnitIngredientNameIssue } from './unit.helpers';

const requiresCount = { message: 'apiResponses.units.ingredientNameRequiresCountKind', field: 'kind' };
const noSymbol = { message: 'apiResponses.units.ingredientNameNotAllowedWithSymbol', field: 'symbol' };

describe('getUnitIngredientNameIssue', () => {
	it.each([
		{ title: 'a count unit without a symbol', unit: { useIngredientName: true, kind: 'count' } },
		{ title: 'a count unit with a null symbol', unit: { useIngredientName: true, kind: 'count', symbol: null } },
		{ title: 'a unit that is not written with the ingredient name', unit: { kind: 'volume', symbol: 'ml' } },
		{ title: 'a unit that explicitly is not', unit: { useIngredientName: false, kind: 'mass', symbol: 'g' } },
	])('finds no issue for $title', ({ unit }) => {
		expect(getUnitIngredientNameIssue(unit)).toBeUndefined();
	});

	it.each([
		{ kind: 'volume', symbol: undefined, expected: requiresCount },
		{ kind: 'informal', symbol: undefined, expected: requiresCount },
		{ kind: undefined, symbol: undefined, expected: requiresCount },
		{ kind: 'count', symbol: 'u', expected: noSymbol },
		// The kind is checked first, so a wrong kind with a symbol reports the kind.
		{ kind: 'mass', symbol: 'g', expected: requiresCount },
	])('reports $expected.field for kind $kind and symbol $symbol', ({ kind, symbol, expected }) => {
		expect(getUnitIngredientNameIssue({ useIngredientName: true, kind, symbol })).toEqual(expected);
	});
});

describe('assertUnitIngredientName', () => {
	it('accepts a valid unit written with the ingredient name and any other unit', () => {
		expect(() => assertUnitIngredientName({ useIngredientName: true, kind: 'count' }, 'test')).not.toThrow();
		expect(() => assertUnitIngredientName({ kind: 'volume', symbol: 'ml' }, 'test')).not.toThrow();
	});

	it.each([
		{ title: 'the kind is not count', unit: { useIngredientName: true, kind: 'volume' }, issue: requiresCount },
		{
			title: 'the unit has a symbol',
			unit: { useIngredientName: true, kind: 'count', symbol: 'u' },
			issue: noSymbol,
		},
	])('throws a BadRequestError when $title', ({ unit, issue }) => {
		expect(() => assertUnitIngredientName(unit, 'test')).toThrow(BadRequestError);
		expect(() => assertUnitIngredientName(unit, 'test')).toThrow(issue.message);
	});
});
