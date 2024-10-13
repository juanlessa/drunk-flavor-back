import { z } from 'zod';
import { UserRolesEnum } from '../entities/user.entity';
import { LocaleKey } from '@/shared/types/locale.types';

// fields validation
export const userIdValidation = z
	.string({ required_error: 'apiResponses.users.requiredId' satisfies LocaleKey })
	.length(24, { message: 'apiResponses.users.invalidIdFormat' satisfies LocaleKey });

export const userNameValidation = z
	.string({ required_error: 'apiResponses.users.requiredName' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { message: 'apiResponses.users.invalidNameFormat' satisfies LocaleKey })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const userSurnameValidation = z
	.string({ required_error: 'apiResponses.users.requiredSurname' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { message: 'apiResponses.users.invalidSurnameFormat' satisfies LocaleKey })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const userEmailValidation = z
	.string({ required_error: 'apiResponses.users.requiredEmail' satisfies LocaleKey })
	.email({ message: 'apiResponses.users.invalidEmailFormat' satisfies LocaleKey });

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}\[\]:;"'<>,.?/~`]).{8,64}$/;
export const userPasswordValidation = z
	.string({ required_error: 'apiResponses.users.requiredPassword' satisfies LocaleKey })
	.min(8, { message: 'apiResponses.users.invalidPasswordMinSize' satisfies LocaleKey })
	.max(64, { message: 'apiResponses.users.invalidPasswordMaxSize' satisfies LocaleKey })
	.regex(passwordPattern, { message: 'apiResponses.users.weakPassword' satisfies LocaleKey });

export const userRoleValidation = z.enum([UserRolesEnum.admin, UserRolesEnum.partner], {
	required_error: 'apiResponses.users.requiredRole' satisfies LocaleKey,
	message: 'apiResponses.users.invalidRoleFormat' satisfies LocaleKey,
});
