import {
	userEmailValidation,
	userNameValidation,
	userPasswordValidation,
	userRoleValidation,
	userSurnameValidation,
} from '@/core/accounts/schemas/user.schemas';
import { z } from 'zod';

export const createUserSchema = z.object({
	name: userNameValidation,
	surname: userSurnameValidation,
	email: userEmailValidation,
	password: userPasswordValidation,
	role: userRoleValidation,
});
