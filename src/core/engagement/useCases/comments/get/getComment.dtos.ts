import { z } from 'zod/v4';
import { getCommentSchema } from './getComment.schema';

export type GetCommentReqParam = z.infer<typeof getCommentSchema>;

export type GetCommentCommand = {
	id: string;
};
