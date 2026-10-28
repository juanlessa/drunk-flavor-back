import { z } from 'zod/v4';
import { userAdministrationRoleValidation, userIdValidation } from '@/core/accounts/schemas/user.schemas';

export const updateUserRoleSchema = z.object({
	userId: userIdValidation,
	role: userAdministrationRoleValidation,
});
