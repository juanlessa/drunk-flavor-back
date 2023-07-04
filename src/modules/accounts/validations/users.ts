import { USER_ERRORS } from '@modules/accounts/errors/userErrors';
import { z } from 'zod';

// fields validation
const idValidation = z
	.string({ required_error: USER_ERRORS.required_id })
	.length(24, { message: USER_ERRORS.invalid_id_format });

const nameValidation = z
	.string({ required_error: USER_ERRORS.required_name })
	.trim()
	.toLowerCase()
	.min(1, { message: USER_ERRORS.invalid_name_format })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

const surnameValidation = z
	.string({ required_error: USER_ERRORS.required_surname })
	.trim()
	.toLowerCase()
	.min(1, { message: USER_ERRORS.required_surname })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

const emailValidation = z
	.string({ required_error: USER_ERRORS.required_email })
	.email({ message: USER_ERRORS.invalid_email_format });

const passwordValidation = z
	.string({ required_error: USER_ERRORS.required_password })
	.min(8, { message: USER_ERRORS.invalid_password_format });

const roleValidation = z
	.string({ required_error: USER_ERRORS.required_role })
	.trim()
	.toLowerCase()
	.min(1, { message: USER_ERRORS.invalid_role_format });

// schemas
const createUserSchema = z.object({
	name: nameValidation,
	surname: surnameValidation,
	email: emailValidation,
	password: passwordValidation,
	role: roleValidation
});

const deleteUserSchema = z.object({
	id: idValidation
});

const profileUserSchema = z.object({
	id: idValidation
});

const updateUserSchema = z.object({
	id: idValidation,
	name: nameValidation,
	surname: surnameValidation,
	email: emailValidation,
	password: passwordValidation
});

const updateUserRoleSchema = z.object({
	userId: idValidation,
	role: roleValidation
});
const authenticateUserSchema = z.object({
	email: emailValidation,
	password: passwordValidation
});

export {
	createUserSchema,
	deleteUserSchema,
	profileUserSchema,
	updateUserSchema,
	updateUserRoleSchema,
	authenticateUserSchema
};
