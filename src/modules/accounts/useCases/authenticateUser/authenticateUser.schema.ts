import { userEmailValidation, userPasswordValidation } from '@/modules/accounts/schemas/user.schemas';
import { z } from 'zod';

export const authenticateUserSchema = z.object({
	email: userEmailValidation,
	password: userPasswordValidation,
});
