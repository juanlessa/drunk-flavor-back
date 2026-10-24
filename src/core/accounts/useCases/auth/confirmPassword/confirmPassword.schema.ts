import { z } from 'zod/v4';
import { userPasswordValidation } from '@/core/accounts/schemas/user.schemas';
import { tokenValidation } from '@/core/accounts/schemas/token.schemas';
import { LocaleKey } from '@/shared/types/locale.types';

export const confirmPasswordSchema = z
	.object({
		token: tokenValidation,
		password: userPasswordValidation,
		confirmPassword: userPasswordValidation,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'apiResponses.users.passwordsDoNotMatchConfirm' satisfies LocaleKey,
		path: ['confirmPassword'],
	});
