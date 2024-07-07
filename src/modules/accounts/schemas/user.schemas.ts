import { USER_MESSAGES } from '@/modules/accounts/constants/users.constants';
import { z } from 'zod';
import { UserRolesEnum } from '../entities/user.entity';

// fields validation
export const userIdValidation = z
	.string({ required_error: USER_MESSAGES.requiredId.message })
	.length(24, { message: USER_MESSAGES.invalidIdFormat.message });

export const userNameValidation = z
	.string({ required_error: USER_MESSAGES.requiredName.message })
	.trim()
	.toLowerCase()
	.min(1, { message: USER_MESSAGES.invalidNameFormat.message })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const userSurnameValidation = z
	.string({ required_error: USER_MESSAGES.requiredSurname.message })
	.trim()
	.toLowerCase()
	.min(1, { message: USER_MESSAGES.invalidSurnameFormat.message })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const userEmailValidation = z
	.string({ required_error: USER_MESSAGES.requiredEmail.message })
	.email({ message: USER_MESSAGES.invalidEmailFormat.message });

export const userPasswordValidation = z
	.string({ required_error: USER_MESSAGES.requiredPassword.message })
	.min(8, { message: USER_MESSAGES.invalidPasswordFormat.message });

export const userRoleValidation = z.enum([UserRolesEnum.admin, UserRolesEnum.partner], {
	required_error: USER_MESSAGES.requiredRole.message,
	message: USER_MESSAGES.invalidRoleFormat.message,
});
