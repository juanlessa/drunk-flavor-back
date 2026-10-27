import {
	userEmailValidation,
	userNameValidation,
	userPasswordValidation,
	userAdministrationRoleValidation,
	userSurnameValidation,
} from '@/core/accounts/schemas/user.schemas';
import { z } from 'zod/v4';

export const createUserSchema = z.object({
	name: userNameValidation,
	surname: userSurnameValidation,
	email: userEmailValidation,
	password: userPasswordValidation,
	role: userAdministrationRoleValidation,
});
