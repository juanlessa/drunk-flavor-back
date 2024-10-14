import { z } from 'zod';
import { userPasswordValidation } from '../../schemas/user.schemas';
import { LocaleKey } from '@/shared/types/locale.types';

export const updatePasswordSchema = z
	.object({
		currentPassword: userPasswordValidation,
		newPassword: userPasswordValidation,
		confirmNewPassword: userPasswordValidation,
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: 'apiResponses.users.passwordsDoNotMatchConfirm' satisfies LocaleKey,
		path: ['confirmNewPassword'],
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: 'apiResponses.users.newPasswordCannotMatchCurrent' satisfies LocaleKey,
		path: ['newPassword'],
	});
