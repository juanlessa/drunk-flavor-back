import { z } from 'zod';
import { userIdValidation } from '@/modules/accounts/schemas/user.schemas';

export const deleteUserSchema = z.object({
	id: userIdValidation,
});
