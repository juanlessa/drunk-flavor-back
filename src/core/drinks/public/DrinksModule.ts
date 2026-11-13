import { Drink } from '@/core/drinks/entities/drink.entity';
import { IDrinksModule } from './IDrinksModule';
import { ApplyRatingDelta, DrinkRatingSummary } from './applyRatingDelta/applyRatingDelta.dtos';
import { ApplyRatingDeltaService } from './applyRatingDelta/ApplyRatingDelta.service';
import { ClearCreatorByUser } from './clearCreatorByUser/clearCreatorByUser.dtos';
import { ClearCreatorByUserService } from './clearCreatorByUser/ClearCreatorByUser.service';
import { FindDrinkById } from './findDrinkById/findDrinkById.dtos';
import { FindDrinkByIdService } from './findDrinkById/FindDrinkById.service';

export class DrinksModule implements IDrinksModule {
	constructor(
		private findDrinkByIdService: FindDrinkByIdService,
		private applyRatingDeltaService: ApplyRatingDeltaService,
		private clearCreatorByUserService: ClearCreatorByUserService,
	) {}

	findDrinkById(data: FindDrinkById): Promise<Drink | null> {
		return this.findDrinkByIdService.execute(data);
	}

	applyRatingDelta(data: ApplyRatingDelta): Promise<DrinkRatingSummary> {
		return this.applyRatingDeltaService.execute(data);
	}

	clearCreatorByUser(data: ClearCreatorByUser): Promise<number> {
		return this.clearCreatorByUserService.execute(data);
	}
}
