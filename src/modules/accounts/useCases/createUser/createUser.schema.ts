import { validateSchema } from '@middlewares/validateSchema';
import { ICreateUser } from '@modules/accounts/dtos/user.dtos';
import {
	userEmailValidation,
	userNameValidation,
	userPasswordValidation,
	userRoleValidation,
	userSurnameValidation
} from '@modules/accounts/validations/user.validations';
import { z } from 'zod';

const createUserSchema = z.object({
	name: userNameValidation,
	surname: userSurnameValidation,
	email: userEmailValidation,
	password: userPasswordValidation,
	role: userRoleValidation
});

export const createUserValidator = validateSchema<ICreateUser>(createUserSchema);
