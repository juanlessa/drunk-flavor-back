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
