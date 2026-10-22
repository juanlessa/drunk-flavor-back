import { Actor } from '@/shared/accessControl/actor.types';
import { z } from 'zod/v4';
import { createCommentSchema } from './createComment.schema';

export type CreateCommentReqBody = z.infer<typeof createCommentSchema>;

export type CreateCommentCommand = {
	drink_id: string;
	content: string;
	actor: Actor;
};
