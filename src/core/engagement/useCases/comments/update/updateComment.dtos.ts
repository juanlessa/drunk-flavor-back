import { EngagementActor } from '@/core/engagement/types/actor.types';
import { z } from 'zod/v4';
import { updateCommentBodySchema, updateCommentParamsSchema } from './updateComment.schema';

export type UpdateCommentReqBody = z.infer<typeof updateCommentBodySchema>;
export type UpdateCommentReqParam = z.infer<typeof updateCommentParamsSchema>;

export type UpdateCommentCommand = {
	id: string;
	content: string;
	actor: EngagementActor;
};
