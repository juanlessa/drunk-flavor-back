import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { IEngagementModule } from './IEngagementModule';

export class EngagementModule implements IEngagementModule {
	constructor(private commentsRepository: ICommentsRepository) {}

	deleteCommentsByUser(userId: string): Promise<number> {
		return this.commentsRepository.deleteByUser(userId);
	}
}
