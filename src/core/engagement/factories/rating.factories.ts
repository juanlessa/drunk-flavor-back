import { CreateRating } from '@/core/engagement/dtos/rating.dtos';
import { ObjectId } from 'mongodb';

export const createRatingFactory = (rating?: Partial<CreateRating>): CreateRating => ({
	drinkId: rating?.drinkId ?? new ObjectId().toString(),
	userId: rating?.userId ?? new ObjectId().toString(),
	value: rating?.value ?? 4,
});
