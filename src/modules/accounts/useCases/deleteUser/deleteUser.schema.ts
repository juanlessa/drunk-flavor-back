import { validateSchema } from '@middlewares/fieldsValidator';
import { IDeleteUser } from '@modules/accounts/dtos/user.dtos';
import { userIdValidation } from '@modules/accounts/validations/users';
import { z } from 'zod';

const deleteUserSchema = z.object({
	id: userIdValidation
});

export const deleteUserValidator = validateSchema<IDeleteUser>(deleteUserSchema);
