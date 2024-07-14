import { userEmailValidation, userPasswordValidation } from '@/core/accounts/schemas/user.schemas';
import { z } from 'zod';

export const authenticateUserSchema = z.object({
	email: userEmailValidation,
	password: userPasswordValidation,
});
