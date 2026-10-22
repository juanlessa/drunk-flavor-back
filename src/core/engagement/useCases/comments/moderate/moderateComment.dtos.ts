import { CommentStatus } from '@/core/engagement/entities/comment.entity';
import { EngagementActor } from '@/core/engagement/types/actor.types';
import { z } from 'zod/v4';
import { moderateCommentBodySchema, moderateCommentParamsSchema } from './moderateComment.schema';

export type ModerateCommentReqParam = z.infer<typeof moderateCommentParamsSchema>;
export type ModerateCommentReqBody = z.infer<typeof moderateCommentBodySchema>;

export type ModerateCommentCommand = {
	id: string;
	status: CommentStatus;
	actor: EngagementActor;
};
