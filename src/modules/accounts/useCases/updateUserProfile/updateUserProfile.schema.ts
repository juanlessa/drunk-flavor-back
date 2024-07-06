import {
	userEmailValidation,
	userNameValidation,
	userPasswordValidation,
	userSurnameValidation,
} from '@/modules/accounts/schemas/user.schemas';
import { z } from 'zod';

export const updateUserSchema = z.object({
	name: userNameValidation,
	surname: userSurnameValidation,
	email: userEmailValidation,
	password: userPasswordValidation,
});
