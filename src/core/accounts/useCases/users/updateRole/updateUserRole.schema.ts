import { z } from 'zod/v4';
import { userIdValidation, userRoleValidation } from '@/core/accounts/schemas/user.schemas';

export const updateUserRoleSchema = z.object({
	user_id: userIdValidation,
	role: userRoleValidation,
});
