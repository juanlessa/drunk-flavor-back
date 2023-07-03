import { USER_ERRORS } from '@modules/accounts/errors/userErrors';
import { z } from 'zod';
import { AUTHENTICATION_ERRORS } from '../errors/authenticationErrors';

// fields validation
const tokenValidation = z
	.string({ required_error: AUTHENTICATION_ERRORS.required_token })
	.min(1, { message: AUTHENTICATION_ERRORS.invalid_token });

// schemas

const refreshTokenSchema = z.object({
	token: tokenValidation
});
export { refreshTokenSchema };
