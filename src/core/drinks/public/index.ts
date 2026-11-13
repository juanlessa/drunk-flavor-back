import { DrinksModule } from './DrinksModule';
import { IDrinksModule } from './IDrinksModule';
import { resolveApplyRatingDeltaService } from './applyRatingDelta/applyRatingDelta.container';
import { resolveClearCreatorByUserService } from './clearCreatorByUser/clearCreatorByUser.container';
import { resolveFindDrinkByIdService } from './findDrinkById/findDrinkById.container';
import { resolveFindDrinksByIdsService } from './findDrinksByIds/findDrinksByIds.container';

const findDrinkByIdService = resolveFindDrinkByIdService();
const findDrinksByIdsService = resolveFindDrinksByIdsService();
const applyRatingDeltaService = resolveApplyRatingDeltaService();
const clearCreatorByUserService = resolveClearCreatorByUserService();

const drinksModule: IDrinksModule = new DrinksModule(
	findDrinkByIdService,
	findDrinksByIdsService,
	applyRatingDeltaService,
	clearCreatorByUserService,
);

export const resolveDrinksModule = (): IDrinksModule => drinksModule;

export { DrinksModule } from './DrinksModule';
export type { Drink } from '@/core/drinks/entities/drink.entity';
export type { IDrinksModule } from './IDrinksModule';
export type { ApplyRatingDelta, DrinkRatingSummary, RatingCountDelta } from './applyRatingDelta/applyRatingDelta.dtos';
export type { ClearCreatorByUser } from './clearCreatorByUser/clearCreatorByUser.dtos';
export type { FindDrinkById } from './findDrinkById/findDrinkById.dtos';
export type { FindDrinksByIds } from './findDrinksByIds/findDrinksByIds.dtos';
