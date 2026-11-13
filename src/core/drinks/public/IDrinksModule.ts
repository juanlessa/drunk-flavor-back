import { Drink } from '@/core/drinks/entities/drink.entity';
import { ApplyRatingDelta, DrinkRatingSummary } from './applyRatingDelta/applyRatingDelta.dtos';
import { ClearCreatorByUser } from './clearCreatorByUser/clearCreatorByUser.dtos';
import { FindDrinkById } from './findDrinkById/findDrinkById.dtos';

export interface IDrinksModule {
	findDrinkById(data: FindDrinkById): Promise<Drink | null>;
	applyRatingDelta(data: ApplyRatingDelta): Promise<DrinkRatingSummary>;
	clearCreatorByUser(data: ClearCreatorByUser): Promise<number>;
}
