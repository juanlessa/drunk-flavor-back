import { CreateComment } from '@/core/engagement/dtos/comment.dtos';
import { ObjectId } from 'mongodb';

export const createCommentFactory = (comment?: Partial<CreateComment>): CreateComment => ({
	drinkId: comment?.drinkId ?? new ObjectId().toString(),
	userId: comment?.userId ?? new ObjectId().toString(),
	content: comment?.content ?? 'I swapped the lime for tahiti and it turned out great',
});
