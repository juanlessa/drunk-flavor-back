import { CommentListQuery } from '@/core/engagement/dtos/comment.dtos';
import { commentQuerySchema } from '@/core/engagement/schemas/comment.schemas';
import { z } from 'zod/v4';
import { listCommentsByDrinkSchema } from './listCommentsByDrink.schema';

export type ListCommentsByDrinkReqParam = z.infer<typeof listCommentsByDrinkSchema>;
export type ListCommentsByDrinkReqQuery = z.infer<typeof commentQuerySchema>;

export type ListCommentsByDrinkCommand = {
	drink_id: string;
	query: CommentListQuery;
};
