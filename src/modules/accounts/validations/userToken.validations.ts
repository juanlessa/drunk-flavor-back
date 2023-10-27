import { z } from 'zod';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authentication.errors';

// fields validation
export const tokenValidation = z
	.string({ required_error: AUTHENTICATION_ERRORS.required_token })
	.min(1, { message: AUTHENTICATION_ERRORS.invalid_token });
