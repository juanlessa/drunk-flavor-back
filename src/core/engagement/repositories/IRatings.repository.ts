import { CreateRating, RatingListQuery, RatingSummary, UpdateRating } from '@/core/engagement/dtos/rating.dtos';
import { Rating } from '@/core/engagement/entities/rating.entity';

export interface IRatingsRepository {
	create(data: CreateRating): Promise<Rating>;
	update(data: UpdateRating): Promise<Rating>;
	delete(id: string): Promise<Rating>;
	findById(id: string): Promise<Rating | null>;
	findAll(query: RatingListQuery): Promise<Rating[]>;
	findByUser(userId: string, query: RatingListQuery): Promise<Rating[]>;
	findByDrink(drinkId: string, query: RatingListQuery): Promise<Rating[]>;
	findByDrinkAndUser(drinkId: string, userId: string): Promise<Rating | null>;
	summarizeByDrink(drinkId: string): Promise<RatingSummary>;
	deleteByUser(userId: string): Promise<number>;
	deleteByDrink(drinkId: string): Promise<number>;
}
