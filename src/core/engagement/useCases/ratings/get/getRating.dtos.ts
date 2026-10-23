import { z } from 'zod/v4';
import { getRatingSchema } from './getRating.schema';

export type GetRatingReqParam = z.infer<typeof getRatingSchema>;

export type GetRatingCommand = {
	id: string;
};
