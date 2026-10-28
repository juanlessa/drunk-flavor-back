import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { resolveDrinksModule } from '@/core/drinks/public';
import { ObjectId } from 'mongodb';

export const createRatingRecord = async (options?: { drink_id?: string; user_id?: string; value?: number }) => {
	const ratingsRepository = resolveRatingsRepository();
	const drinksModule = resolveDrinksModule();
	const value = options?.value ?? 4;
	const rating = await ratingsRepository.create({
		drink_id: options?.drink_id ?? new ObjectId().toString(),
		user_id: options?.user_id ?? new ObjectId().toString(),
		value,
	});
	await drinksModule.applyRatingDelta({
		drinkId: rating.drink_id,
		countDelta: 1,
		sumDelta: value,
	});
	return { rating, id: rating._id.toString() };
};
