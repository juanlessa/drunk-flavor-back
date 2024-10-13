import { userEmailValidation, userPasswordValidation } from '@/core/accounts/schemas/user.schemas';
import { z } from 'zod';

export const loginSchema = z.object({
	email: userEmailValidation,
	password: userPasswordValidation,
});
