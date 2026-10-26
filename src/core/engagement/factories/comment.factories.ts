import { CreateComment } from '@/core/engagement/dtos/comment.dtos';
import { ObjectId } from 'mongodb';

export const createCommentFactory = (comment?: Partial<CreateComment>): CreateComment => ({
	drink_id: comment?.drink_id ?? new ObjectId().toString(),
	user_id: comment?.user_id ?? new ObjectId().toString(),
	content: comment?.content ?? 'I swapped the lime for tahiti and it turned out great',
});
