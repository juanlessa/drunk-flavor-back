import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { z } from 'zod';

// fields validation
export const userIdValidation = z
	.string({ required_error: USER_ERRORS.required_id })
	.length(24, { message: USER_ERRORS.invalid_id_format });

export const userNameValidation = z
	.string({ required_error: USER_ERRORS.required_name })
	.trim()
	.toLowerCase()
	.min(1, { message: USER_ERRORS.invalid_name_format })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const userSurnameValidation = z
	.string({ required_error: USER_ERRORS.required_surname })
	.trim()
	.toLowerCase()
	.min(1, { message: USER_ERRORS.required_surname })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const userEmailValidation = z
	.string({ required_error: USER_ERRORS.required_email })
	.email({ message: USER_ERRORS.invalid_email_format });

export const userPasswordValidation = z
	.string({ required_error: USER_ERRORS.required_password })
	.min(8, { message: USER_ERRORS.invalid_password_format });

export const userRoleValidation = z
	.string({ required_error: USER_ERRORS.required_role })
	.trim()
	.toLowerCase()
	.min(1, { message: USER_ERRORS.invalid_role_format });
