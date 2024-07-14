import { z } from 'zod';
import { userIdValidation } from '@/core/accounts/schemas/user.schemas';

export const deleteUserSchema = z.object({
	id: userIdValidation,
});
