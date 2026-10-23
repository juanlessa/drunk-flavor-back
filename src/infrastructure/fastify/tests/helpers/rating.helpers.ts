import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { ObjectId } from 'mongodb';

export const createRatingRecord = async (options?: { drink_id?: string; user_id?: string; value?: number }) => {
	const ratingsRepository = resolveRatingsRepository();
	const rating = await ratingsRepository.create({
		drink_id: options?.drink_id ?? new ObjectId().toString(),
		user_id: options?.user_id ?? new ObjectId().toString(),
		value: options?.value ?? 4,
	});
	return { rating, id: rating._id.toString() };
};
