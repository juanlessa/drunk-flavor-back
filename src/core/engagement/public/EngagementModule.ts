import { IEngagementModule } from './IEngagementModule';
import { DeleteCommentsByUser } from './deleteCommentsByUser/deleteCommentsByUser.dtos';
import { DeleteCommentsByUserService } from './deleteCommentsByUser/DeleteCommentsByUser.service';
import {
	DeleteEngagementByDrink,
	DeleteEngagementByDrinkResult,
} from './deleteEngagementByDrink/deleteEngagementByDrink.dtos';
import { DeleteEngagementByDrinkService } from './deleteEngagementByDrink/DeleteEngagementByDrink.service';

export class EngagementModule implements IEngagementModule {
	constructor(
		private deleteCommentsByUserService: DeleteCommentsByUserService,
		private deleteEngagementByDrinkService: DeleteEngagementByDrinkService,
	) {}

	deleteCommentsByUser(data: DeleteCommentsByUser): Promise<number> {
		return this.deleteCommentsByUserService.execute(data);
	}

	deleteEngagementByDrink(data: DeleteEngagementByDrink): Promise<DeleteEngagementByDrinkResult> {
		return this.deleteEngagementByDrinkService.execute(data);
	}
}
