import { userNameValidation, userSurnameValidation } from '@/core/accounts/schemas/user.schemas';
import { z } from 'zod';

export const updateProfileSchema = z.object({
	name: userNameValidation,
	surname: userSurnameValidation,
});
