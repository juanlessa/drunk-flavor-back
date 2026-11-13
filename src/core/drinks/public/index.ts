import { DrinksModule } from './DrinksModule';
import { IDrinksModule } from './IDrinksModule';
import { resolveApplyRatingDeltaService } from './applyRatingDelta/applyRatingDelta.container';
import { resolveClearCreatorByUserService } from './clearCreatorByUser/clearCreatorByUser.container';
import { resolveFindDrinkByIdService } from './findDrinkById/findDrinkById.container';

const findDrinkByIdService = resolveFindDrinkByIdService();
const applyRatingDeltaService = resolveApplyRatingDeltaService();
const clearCreatorByUserService = resolveClearCreatorByUserService();

const drinksModule: IDrinksModule = new DrinksModule(
	findDrinkByIdService,
	applyRatingDeltaService,
	clearCreatorByUserService,
);

export const resolveDrinksModule = (): IDrinksModule => drinksModule;

export { DrinksModule } from './DrinksModule';
export type { IDrinksModule } from './IDrinksModule';
export type { ApplyRatingDelta, DrinkRatingSummary, RatingCountDelta } from './applyRatingDelta/applyRatingDelta.dtos';
export type { ClearCreatorByUser } from './clearCreatorByUser/clearCreatorByUser.dtos';
export type { FindDrinkById } from './findDrinkById/findDrinkById.dtos';
