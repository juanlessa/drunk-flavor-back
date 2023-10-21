import { validateSchema } from '@middlewares/validateSchema';
import { IDeleteUser } from '@modules/accounts/dtos/user.dtos';
import { userIdValidation } from '@modules/accounts/validations/user.validations';
import { z } from 'zod';

const deleteUserSchema = z.object({
	id: userIdValidation
});

export const deleteUserValidator = validateSchema<IDeleteUser>(deleteUserSchema);
