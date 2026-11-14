import { IEngagementModule } from './IEngagementModule';
import { DeleteCommentsByUser } from './deleteCommentsByUser/deleteCommentsByUser.dtos';
import { DeleteCommentsByUserService } from './deleteCommentsByUser/DeleteCommentsByUser.service';
import { DeleteFavoritesByUser } from './deleteFavoritesByUser/deleteFavoritesByUser.dtos';
import { DeleteFavoritesByUserService } from './deleteFavoritesByUser/DeleteFavoritesByUser.service';
import {
	DeleteEngagementByDrink,
	DeleteEngagementByDrinkResult,
} from './deleteEngagementByDrink/deleteEngagementByDrink.dtos';
import { DeleteEngagementByDrinkService } from './deleteEngagementByDrink/DeleteEngagementByDrink.service';

export class EngagementModule implements IEngagementModule {
	constructor(
		private deleteCommentsByUserService: DeleteCommentsByUserService,
		private deleteFavoritesByUserService: DeleteFavoritesByUserService,
		private deleteEngagementByDrinkService: DeleteEngagementByDrinkService,
	) {}

	deleteCommentsByUser(data: DeleteCommentsByUser): Promise<number> {
		return this.deleteCommentsByUserService.execute(data);
	}

	deleteFavoritesByUser(data: DeleteFavoritesByUser): Promise<number> {
		return this.deleteFavoritesByUserService.execute(data);
	}

	deleteEngagementByDrink(data: DeleteEngagementByDrink): Promise<DeleteEngagementByDrinkResult> {
		return this.deleteEngagementByDrinkService.execute(data);
	}
}
