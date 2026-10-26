import { CommentListQuery } from '@/core/engagement/dtos/comment.dtos';
import { commentQuerySchema } from '@/core/engagement/schemas/comment.schemas';
import { Actor } from '@/shared/accessControl/actor.types';
import { z } from 'zod/v4';

export type ListMyCommentsReqQuery = z.infer<typeof commentQuerySchema>;

export type ListMyCommentsCommand = {
	query: CommentListQuery;
	actor: Actor;
};
