import { userEmailValidation, userPasswordValidation } from '@/core/accounts/schemas/user.schemas';
import { z } from 'zod/v4';

export const loginSchema = z.object({
	email: userEmailValidation,
	password: userPasswordValidation,
});
