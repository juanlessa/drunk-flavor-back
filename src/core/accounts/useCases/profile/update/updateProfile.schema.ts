import { userNameValidation, userSurnameValidation } from '@/core/accounts/schemas/user.schemas';
import { z } from 'zod/v4';

export const updateProfileSchema = z.object({
	name: userNameValidation,
	surname: userSurnameValidation,
});
