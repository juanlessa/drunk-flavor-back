import { reconcileDrinkRequiredIngredients } from '@/core/drinks/infra/mongo/maintenance/reconcileDrinkRequiredIngredients';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { logger } from '@/shared/providers/logger';

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
