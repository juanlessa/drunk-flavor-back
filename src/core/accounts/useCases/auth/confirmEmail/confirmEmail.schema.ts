import { z } from 'zod/v4';
import { tokenValidation } from '@/core/accounts/schemas/token.schemas';

export const confirmEmailSchema = z.object({
	token: tokenValidation,
});
