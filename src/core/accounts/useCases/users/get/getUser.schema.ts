import { z } from 'zod';
import { userIdValidation } from '@/core/accounts/schemas/user.schemas';

export const getUserSchema = z.object({
	id: userIdValidation,
});
