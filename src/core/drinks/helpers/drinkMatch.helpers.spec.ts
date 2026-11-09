import { describe, expect, it } from 'vitest';
import { getMissingIngredientIds, getRequiredIngredientIds } from './drinkMatch.helpers';

const line = (id: string, optional = false) => ({ ingredient: { id }, optional });

describe('getRequiredIngredientIds', () => {
	it('lists the ingredients of the recipe in order', () => {
		expect(getRequiredIngredientIds([line('gin'), line('lime'), line('sugar')])).toEqual(['gin', 'lime', 'sugar']);
	});

	it('leaves out the optional ingredients', () => {
		expect(getRequiredIngredientIds([line('gin'), line('foam', true), line('lime')])).toEqual(['gin', 'lime']);
	});

	it('lists an ingredient that appears more than once only once', () => {
		expect(getRequiredIngredientIds([line('gin'), line('lime'), line('gin')])).toEqual(['gin', 'lime']);
	});

	it('keeps an ingredient that is required in one line even if another line makes it optional', () => {
		expect(getRequiredIngredientIds([line('gin', true), line('gin')])).toEqual(['gin']);
	});

	it.each([
		{ title: 'a recipe with no ingredients', lines: [] },
		{ title: 'a recipe whose ingredients are all optional', lines: [line('foam', true)] },
	])('returns an empty list for $title', ({ lines }) => {
		expect(getRequiredIngredientIds(lines)).toEqual([]);
	});
});

describe('getMissingIngredientIds', () => {
	it('returns the required ingredients the person does not have, in the order given', () => {
		expect(getMissingIngredientIds(['gin', 'lime', 'sugar'], new Set(['lime']))).toEqual(['gin', 'sugar']);
	});

	it('returns nothing when the person has all of them, extra ingredients included', () => {
		expect(getMissingIngredientIds(['gin', 'lime'], new Set(['gin', 'lime', 'rum']))).toEqual([]);
	});

	it('returns all of them when the person has none', () => {
		expect(getMissingIngredientIds(['gin', 'lime'], new Set())).toEqual(['gin', 'lime']);
	});
});
