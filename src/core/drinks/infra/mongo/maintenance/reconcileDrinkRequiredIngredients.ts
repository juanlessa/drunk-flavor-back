import { DrinkModel, DrinkPersistence } from '../entities/drink.model';
import { getRequiredIngredientObjectIds } from '../helpers/drinkRequiredIngredients.helpers';

export const RECONCILE_BATCH_SIZE = 200;

type DrinkRecipe = Pick<DrinkPersistence, '_id' | 'ingredients'>;

/**
 * Writes `required_ingredient_ids` on every drink from its recipe. The search by ingredients matches on it, so
 * drinks created before the field existed only show up there after this runs. It is safe to run again: the field
 * is always recalculated from the recipe.
 *
 * @returns how many drinks were written.
 */
export const reconcileDrinkRequiredIngredients = async (): Promise<number> => {
	let updatedDrinks = 0;
	let batch: DrinkRecipe[] = [];

	const flush = async () => {
		if (batch.length === 0) return;
		await DrinkModel.bulkWrite(
			batch.map(({ _id, ingredients }) => ({
				updateOne: {
					filter: { _id },
					update: { $set: { required_ingredient_ids: getRequiredIngredientObjectIds(ingredients) } },
				},
			})),
			// The recipe did not change, only the field derived from it, so `updated_at` must stay as it was.
			{ timestamps: false },
		);
		updatedDrinks += batch.length;
		batch = [];
	};

	const cursor = DrinkModel.find({}).select('ingredients').lean<DrinkRecipe[]>().cursor();
	for await (const drink of cursor) {
		batch.push(drink);
		if (batch.length >= RECONCILE_BATCH_SIZE) await flush();
	}
	await flush();
	return updatedDrinks;
};
