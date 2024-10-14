import { z } from 'zod';
import { userPasswordValidation } from '../../schemas/user.schemas';
import { tokenValidation } from '../../schemas/userToken.schemas';
import { LocaleKey } from '@/shared/types/locale.types';

export const resetPasswordSchema = z
	.object({
		token: tokenValidation,
		password: userPasswordValidation,
		confirmPassword: userPasswordValidation,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'apiResponses.users.passwordsDoNotMatchConfirm' satisfies LocaleKey,
		path: ['confirmPassword'],
	});
