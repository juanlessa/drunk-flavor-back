import { userEmailValidation } from '@/core/accounts/schemas/user.schemas';
import { z } from 'zod';

export const forgotPasswordSchema = z.object({
	email: userEmailValidation,
});
