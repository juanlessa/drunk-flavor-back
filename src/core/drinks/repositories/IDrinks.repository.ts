import {
	CreateDrink,
	DrinkIngredientMatch,
	FindDrinkByName,
	FindDrinksByIngredients,
	UpdateDrink,
} from '@/core/drinks/dtos/drink.dtos';
import { Drink } from '@/core/drinks/entities/drink.entity';
import type { ApplyRatingDelta, DrinkRatingSummary } from '@/core/drinks/public/IDrinksModule';
import { QueryParams } from '@/shared/types/query.types';

export interface IDrinksRepository {
	create(data: CreateDrink): Promise<Drink>;
	update(data: UpdateDrink): Promise<Drink>;
	delete(id: string): Promise<Drink>;
	findByName(data: FindDrinkByName): Promise<Drink | null>;
	findById(id: string): Promise<Drink | null>;
	findAll(query: QueryParams): Promise<Drink[]>;
	/**
	 * The drinks that use at least one of the given ingredients and miss no more than `maxMissing` of their required
	 * ingredients, the most complete first and, among those, the best rated.
	 */
	findByIngredients(input: FindDrinksByIngredients): Promise<DrinkIngredientMatch[]>;
	applyRatingDelta(input: ApplyRatingDelta): Promise<DrinkRatingSummary>;
}
