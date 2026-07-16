import { z } from 'zod/v4';
import { userIdValidation } from '@/core/accounts/schemas/user.schemas';

export const getUserSchema = z.object({
	id: userIdValidation,
});
