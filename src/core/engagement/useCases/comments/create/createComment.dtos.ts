import { Actor } from '@/shared/accessControl/actor.types';
import { z } from 'zod/v4';
import { createCommentSchema } from './createComment.schema';

export type CreateCommentReqBody = z.infer<typeof createCommentSchema>;

export type CreateCommentCommand = {
	drinkId: string;
	content: string;
	actor: Actor;
};
