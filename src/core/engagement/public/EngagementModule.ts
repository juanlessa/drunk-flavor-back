import { IEngagementModule } from './IEngagementModule';
import { DeleteCommentsByUser } from './deleteCommentsByUser/deleteCommentsByUser.dtos';
import { DeleteCommentsByUserService } from './deleteCommentsByUser/DeleteCommentsByUser.service';

export class EngagementModule implements IEngagementModule {
	constructor(private deleteCommentsByUserService: DeleteCommentsByUserService) {}

	deleteCommentsByUser(data: DeleteCommentsByUser): Promise<number> {
		return this.deleteCommentsByUserService.execute(data);
	}
}
