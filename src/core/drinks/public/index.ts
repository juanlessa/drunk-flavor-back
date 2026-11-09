import {
	resolveCategoriesRepository,
	resolveDrinksRepository,
	resolveIngredientsRepository,
	resolveUnitsRepository,
} from '@/core/drinks/infra/mongo/container';
import { DrinksModule } from './DrinksModule';
import { IDrinksModule } from './IDrinksModule';

const drinksModule: IDrinksModule = new DrinksModule(
	resolveDrinksRepository(),
	resolveIngredientsRepository(),
	resolveCategoriesRepository(),
	resolveUnitsRepository(),
);

export const resolveDrinksModule = (): IDrinksModule => drinksModule;

export { DrinksModule } from './DrinksModule';
export type { ApplyRatingDelta, DrinkRatingSummary, IDrinksModule, RatingCountDelta } from './IDrinksModule';
