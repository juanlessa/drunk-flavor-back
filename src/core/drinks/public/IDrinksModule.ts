import { Drink } from '@/core/drinks/entities/drink.entity';
import { ApplyRatingDelta, DrinkRatingSummary } from './applyRatingDelta/applyRatingDelta.dtos';
import { ClearCreatorByUser } from './clearCreatorByUser/clearCreatorByUser.dtos';
import { FindDrinkById } from './findDrinkById/findDrinkById.dtos';
import { FindDrinksByIds } from './findDrinksByIds/findDrinksByIds.dtos';

export interface IDrinksModule {
	findDrinkById(data: FindDrinkById): Promise<Drink | null>;
	/** The drinks that exist among the given ids, in no particular order; ids that match no drink are omitted. */
	findDrinksByIds(data: FindDrinksByIds): Promise<Drink[]>;
	applyRatingDelta(data: ApplyRatingDelta): Promise<DrinkRatingSummary>;
	clearCreatorByUser(data: ClearCreatorByUser): Promise<number>;
}
