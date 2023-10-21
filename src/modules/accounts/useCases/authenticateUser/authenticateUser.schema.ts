import { IAuthenticateUser } from '@modules/accounts/dtos/authentication.dtos';
import { validateSchema } from '@middlewares/validateSchema';
import { userEmailValidation, userPasswordValidation } from '@modules/accounts/validations/user.validations';
import { z } from 'zod';

const authenticateUserSchema = z.object({
	email: userEmailValidation,
	password: userPasswordValidation
});

export const authenticateUserValidator = validateSchema<IAuthenticateUser>(authenticateUserSchema);
