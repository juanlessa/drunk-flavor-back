import {
	userEmailValidation,
	userNameValidation,
	userPasswordValidation,
	userSurnameValidation,
} from '@/core/accounts/schemas/user.schemas';
import { z } from 'zod/v4';

export const signupSchema = z.object({
	name: userNameValidation,
	surname: userSurnameValidation,
	email: userEmailValidation,
	password: userPasswordValidation,
});
