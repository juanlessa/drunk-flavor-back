import { CommentStatus } from '@/core/engagement/entities/comment.entity';
import { resolveCommentsRepository } from '@/core/engagement/infra/mongo/container';
import { ObjectId } from 'mongodb';

export const createCommentRecord = async (options?: {
	drink_id?: string;
	user_id?: string;
	content?: string;
	status?: CommentStatus;
}) => {
	const commentsRepository = resolveCommentsRepository();
	const comment = await commentsRepository.create({
		drink_id: options?.drink_id ?? new ObjectId().toString(),
		user_id: options?.user_id ?? new ObjectId().toString(),
		content: options?.content ?? 'A sample comment',
	});
	if (options?.status) {
		await commentsRepository.updateStatus({ id: comment._id.toString(), status: options.status });
	}
	return { comment, id: comment._id.toString() };
};
