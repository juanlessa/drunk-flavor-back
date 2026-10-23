import { CommentListQuery } from '@/core/engagement/dtos/comment.dtos';
import { commentQuerySchema } from '@/core/engagement/schemas/comment.schemas';
import { z } from 'zod/v4';

export type ListCommentsReqQuery = z.infer<typeof commentQuerySchema>;

export type ListCommentsCommand = {
	query: CommentListQuery;
};
