import { validateSchema } from '@middlewares/fieldsValidator';
import { IUpdateUserRole } from '@modules/accounts/dtos/user.dtos';
import { userIdValidation, userRoleValidation } from '@modules/accounts/validations/users';
import { z } from 'zod';

const updateUserRoleSchema = z.object({
	user_id: userIdValidation,
	role: userRoleValidation
});

export const updateUserRoleValidator = validateSchema<IUpdateUserRole>(updateUserRoleSchema);
