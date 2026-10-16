import { userEmailValidation, userPasswordValidation } from '@/core/accounts/schemas/user.schemas';
import { z } from 'zod/v4';

export const signinSchema = z.object({
	email: userEmailValidation,
	password: userPasswordValidation,
});
