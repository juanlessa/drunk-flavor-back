import { z } from 'zod';
import { tokenValidation } from '@/core/accounts/schemas/userToken.schemas';

export const confirmEmailSchema = z.object({
	token: tokenValidation,
});
