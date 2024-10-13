import { z } from 'zod';
import { userPasswordValidation } from '../../schemas/user.schemas';
import { tokenValidation } from '../../schemas/userToken.schemas';

export const resetPasswordSchema = z
	.object({
		token: tokenValidation,
		password: userPasswordValidation,
		confirmPassword: userPasswordValidation,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});
