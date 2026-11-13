import {
	ApplyRatingDelta,
	DrinkRatingSummary,
	CreateDrink,
	DrinkIngredientMatch,
	FindDrinkByName,
	FindDrinksByIngredients,
	UpdateDrink,
} from '@/core/drinks/dtos/drink.dtos';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { QueryParams } from '@/shared/types/query.types';

export interface IDrinksRepository {
	create(data: CreateDrink): Promise<Drink>;
	update(data: UpdateDrink): Promise<Drink>;
	delete(id: string): Promise<Drink>;
	findByName(data: FindDrinkByName): Promise<Drink | null>;
	findById(id: string): Promise<Drink | null>;
	findAll(query: QueryParams): Promise<Drink[]>;
	/** Like `findAll`, with the records created by `userId` first and the others after, each group in the order of the query. */
	findAllOwnedFirst(query: QueryParams, userId: string): Promise<Drink[]>;
	/** Removes the user as creator and last editor of the records, which stay as they are. Returns how many were touched. */
	clearCreatorByUser(userId: string): Promise<number>;
	/**
	 * The drinks that use at least one of the given ingredients and miss no more than `maxMissing` of their required
	 * ingredients, the most complete first and, among those, the best rated.
	 */
	findByIngredients(input: FindDrinksByIngredients): Promise<DrinkIngredientMatch[]>;
	applyRatingDelta(input: ApplyRatingDelta): Promise<DrinkRatingSummary>;
}
