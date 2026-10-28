import { CommentStatus } from '@/core/engagement/entities/comment.entity';
import { resolveCommentsRepository } from '@/core/engagement/infra/mongo/container';
import { ObjectId } from 'mongodb';

export const createCommentRecord = async (options?: {
	drinkId?: string;
	userId?: string;
	content?: string;
	status?: CommentStatus;
}) => {
	const commentsRepository = resolveCommentsRepository();
	const comment = await commentsRepository.create({
		drinkId: options?.drinkId ?? new ObjectId().toString(),
		userId: options?.userId ?? new ObjectId().toString(),
		content: options?.content ?? 'A sample comment',
	});
	if (options?.status) await commentsRepository.updateStatus({ id: comment.id, status: options.status });
	return { comment, id: comment.id };
};
