import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';
import { getIngredientObjectIds, getRequiredIngredientObjectIds } from './drinkRequiredIngredients.helpers';

const gin = new Types.ObjectId();
const lime = new Types.ObjectId();
const line = (ingredient: Types.ObjectId, optional?: boolean) => ({
	...(optional === undefined ? {} : { optional }),
	ingredient: { _id: ingredient },
});

describe('getRequiredIngredientObjectIds', () => {
	it('returns the ids of the required ingredients, in recipe order', () => {
		expect(getRequiredIngredientObjectIds([line(gin, false), line(lime, false)])).toEqual([gin, lime]);
	});

	it('leaves out the optional ingredients', () => {
		expect(getRequiredIngredientObjectIds([line(gin, false), line(lime, true)])).toEqual([gin]);
	});

	it('treats a line with no optional flag as required', () => {
		expect(getRequiredIngredientObjectIds([line(gin)])).toEqual([gin]);
	});

	it('returns an ingredient that appears in several lines only once', () => {
		const sameIdAsGin = new Types.ObjectId(gin.toHexString());

		expect(getRequiredIngredientObjectIds([line(gin, false), line(lime, false), line(sameIdAsGin, false)])).toEqual(
			[gin, lime],
		);
	});

	it('returns an empty list when there is nothing required', () => {
		expect(getRequiredIngredientObjectIds([])).toEqual([]);
		expect(getRequiredIngredientObjectIds([line(gin, true)])).toEqual([]);
	});
});

describe('getIngredientObjectIds', () => {
	it('returns the ids of every ingredient, optional or not, in recipe order', () => {
		expect(getIngredientObjectIds([line(gin, false), line(lime, true)])).toEqual([gin, lime]);
	});
	it('returns an ingredient that appears in several lines only once', () => {
		const sameIdAsGin = new Types.ObjectId(gin.toHexString());
		expect(getIngredientObjectIds([line(gin, false), line(sameIdAsGin, true)])).toEqual([gin]);
	});
	it('returns an empty list when there are no lines', () => {
		expect(getIngredientObjectIds([])).toEqual([]);
	});
});
