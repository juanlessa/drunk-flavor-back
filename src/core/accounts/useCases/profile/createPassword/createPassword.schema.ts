import { z } from 'zod/v4';
import { userPasswordValidation } from '@/core/accounts/schemas/user.schemas';

export const createPasswordSchema = z.object({
	password: userPasswordValidation,
});
