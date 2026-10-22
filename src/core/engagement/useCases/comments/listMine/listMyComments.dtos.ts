import { CommentListQuery } from '@/core/engagement/dtos/comment.dtos';
import { commentQuerySchema } from '@/core/engagement/schemas/comment.schemas';
import { EngagementActor } from '@/core/engagement/types/actor.types';
import { z } from 'zod/v4';

export type ListMyCommentsReqQuery = z.infer<typeof commentQuerySchema>;

export type ListMyCommentsCommand = {
	query: CommentListQuery;
	actor: EngagementActor;
};
