import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { resolveDrinksModule } from '@/core/drinks/public';
import { ObjectId } from 'mongodb';

export const createRatingRecord = async (options?: { drinkId?: string; userId?: string; value?: number }) => {
	const ratingsRepository = resolveRatingsRepository();
	const value = options?.value ?? 4;
	const rating = await ratingsRepository.create({
		drinkId: options?.drinkId ?? new ObjectId().toString(),
		userId: options?.userId ?? new ObjectId().toString(),
		value,
	});
	await resolveDrinksModule().applyRatingDelta({
		drinkId: rating.drinkId,
		countDelta: 1,
		sumDelta: value,
	});
	return { rating, id: rating.id };
};
