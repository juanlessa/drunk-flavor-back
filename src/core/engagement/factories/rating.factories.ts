import { CreateRating } from '@/core/engagement/dtos/rating.dtos';
import { ObjectId } from 'mongodb';

export const createRatingFactory = (rating?: Partial<CreateRating>): CreateRating => ({
	drink_id: rating?.drink_id ?? new ObjectId().toString(),
	user_id: rating?.user_id ?? new ObjectId().toString(),
	value: rating?.value ?? 4,
});
