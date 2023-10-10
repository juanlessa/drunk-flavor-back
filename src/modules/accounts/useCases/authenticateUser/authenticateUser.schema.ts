import { validateSchema } from '@middlewares/fieldsValidator';
import { IAuthenticateUser } from '@modules/accounts/dtos/user.dtos';
import { userEmailValidation, userPasswordValidation } from '@modules/accounts/validations/users';
import { z } from 'zod';

const authenticateUserSchema = z.object({
	email: userEmailValidation,
	password: userPasswordValidation
});

export const authenticateUserValidator = validateSchema<IAuthenticateUser>(authenticateUserSchema);
