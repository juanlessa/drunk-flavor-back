import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { RatingModel } from '@/core/engagement/infra/mongo/entities/rating.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { logger } from '@/shared/providers/logger';

type DrinkRatingAggregate = {
	_id: string;
	ratings_sum: number;
	ratings_count: number;
	avg_rating: number;
};

const reconcileDrinkRatings = async (): Promise<number> => {
	const transactionManager = resolveTransactionManager();

	return transactionManager.withTransaction(async () => {
		const aggregates = await RatingModel.aggregate<DrinkRatingAggregate>([
			{
				$group: {
					_id: '$drink_id',
					ratings_sum: { $sum: '$value' },
					ratings_count: { $sum: 1 },
					avg_rating: { $avg: '$value' },
				},
			},
		]).exec();

		await DrinkModel.updateMany({}, { $set: { ratings_sum: 0, ratings_count: 0, avg_rating: 0 } }).exec();

		if (aggregates.length > 0) {
			await DrinkModel.bulkWrite(
				aggregates.map((aggregate) => ({
					updateOne: {
						filter: { _id: aggregate._id },
						update: {
							$set: {
								ratings_sum: aggregate.ratings_sum,
								ratings_count: aggregate.ratings_count,
								avg_rating: aggregate.avg_rating,
							},
						},
					},
				})),
			);
		}

		return aggregates.length;
	});
};

const main = async (): Promise<void> => {
	await MongoConnection.Instance.start();
	try {
		const updatedDrinks = await reconcileDrinkRatings();
		logger.info({ updatedDrinks }, 'Drink rating projections reconciled successfully.');
	} finally {
		await MongoConnection.Instance.stop();
	}
};

await main();
