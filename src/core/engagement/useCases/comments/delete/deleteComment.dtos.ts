import { EngagementActor } from '@/core/engagement/types/actor.types';
import { z } from 'zod/v4';
import { deleteCommentSchema } from './deleteComment.schema';

export type DeleteCommentReqParam = z.infer<typeof deleteCommentSchema>;

export type DeleteCommentCommand = {
	id: string;
	actor: EngagementActor;
};
