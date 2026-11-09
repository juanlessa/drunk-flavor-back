import { DrinkModel, DrinkPersistence } from '@/core/drinks/infra/mongo/entities/drink.model';
import { getRequiredIngredientObjectIds } from '@/core/drinks/infra/mongo/helpers/drinkRequiredIngredients.helpers';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { logger } from '@/shared/providers/logger';

const BATCH_SIZE = 200;

type DrinkRecipe = Pick<DrinkPersistence, '_id' | 'ingredients'>;

/**
 * Writes `required_ingredient_ids` on every drink from its recipe. The search by ingredients matches on it, so
 * drinks created before the field existed only show up there after this runs. It is safe to run again: the field
 * is always recalculated from the recipe.
 */
const reconcileDrinkRequiredIngredients = async (): Promise<number> => {
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
		);
		updatedDrinks += batch.length;
		batch = [];
	};

	const cursor = DrinkModel.find({}).select('ingredients').lean<DrinkRecipe[]>().cursor();
	for await (const drink of cursor) {
		batch.push(drink);
		if (batch.length >= BATCH_SIZE) await flush();
	}
	await flush();
	return updatedDrinks;
};

const main = async (): Promise<void> => {
	await MongoConnection.Instance.start();
	try {
		const updatedDrinks = await reconcileDrinkRequiredIngredients();
		logger.info({ updatedDrinks }, 'Drink required ingredients reconciled successfully.');
	} finally {
		await MongoConnection.Instance.stop();
	}
};

await main();
