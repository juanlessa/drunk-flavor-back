import { Types } from 'mongoose';

/**
 * The ids of the ingredients a persisted drink cannot be made without: the ones of its non-optional lines, with no
 * repeats. It is what `required_ingredient_ids` stores, so the search by ingredients can match on it.
 */
export const getRequiredIngredientObjectIds = (
	lines: ReadonlyArray<{ optional?: boolean; ingredient: { _id: Types.ObjectId } }>,
): Types.ObjectId[] => {
	const unique = new Map<string, Types.ObjectId>();
	for (const { optional, ingredient } of lines) {
		if (optional) continue;
		unique.set(ingredient._id.toHexString(), ingredient._id);
	}
	return [...unique.values()];
};

/**
 * The ids of every ingredient of a persisted drink, optional or not, with no repeats. The garnishes are not part of
 * the lines it receives. It is what `ingredient_ids` stores: the ingredients a person can pick to find the drink.
 */
export const getIngredientObjectIds = (
	lines: ReadonlyArray<{ ingredient: { _id: Types.ObjectId } }>,
): Types.ObjectId[] => {
	const unique = new Map<string, Types.ObjectId>();
	for (const { ingredient } of lines) unique.set(ingredient._id.toHexString(), ingredient._id);
	return [...unique.values()];
};
