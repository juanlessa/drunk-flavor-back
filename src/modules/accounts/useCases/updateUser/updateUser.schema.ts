import { validateSchema } from '@shared/infra/http/middlewares/validateSchema';
import { IUpdateUser } from '@modules/accounts/dtos/user.dtos';
import {
	userEmailValidation,
	userNameValidation,
	userPasswordValidation,
	userSurnameValidation
} from '@modules/accounts/validations/user.validations';
import { z } from 'zod';

const updateUserSchema = z.object({
	name: userNameValidation,
	surname: userSurnameValidation,
	email: userEmailValidation,
	password: userPasswordValidation
});

export const updateUserValidator = validateSchema<IUpdateUser>(updateUserSchema);
