import { userEmailValidation } from '@/core/accounts/schemas/user.schemas';
import { z } from 'zod';

export const resetUserPasswordSchema = z.object({
	email: userEmailValidation,
});
