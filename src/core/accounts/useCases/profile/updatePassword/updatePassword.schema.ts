import { z } from 'zod/v4';
import { userPasswordValidation } from '@/core/accounts/schemas/user.schemas';
import { LocaleKey } from '@/shared/types/locale.types';

export const updatePasswordSchema = z
	.object({
		currentPassword: userPasswordValidation,
		newPassword: userPasswordValidation,
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: 'apiResponses.users.newPasswordCannotMatchCurrent' satisfies LocaleKey,
		path: ['newPassword'],
	});
