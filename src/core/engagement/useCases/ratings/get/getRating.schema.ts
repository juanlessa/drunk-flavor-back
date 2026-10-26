import { ratingIdValidation } from '@/core/engagement/schemas/rating.schemas';
import { z } from 'zod/v4';

export const getRatingSchema = z.object({
	id: ratingIdValidation,
});
