import { z } from 'zod/v4';
import { tokenValidation } from '@/core/accounts/schemas/userToken.schemas';

export const confirmEmailSchema = z.object({
	token: tokenValidation,
});
