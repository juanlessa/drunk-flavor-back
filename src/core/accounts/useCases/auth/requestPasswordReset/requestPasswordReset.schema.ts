import { userEmailValidation } from '@/core/accounts/schemas/user.schemas';
import { z } from 'zod/v4';

export const requestPasswordResetSchema = z.object({
	email: userEmailValidation,
});
