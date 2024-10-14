import { z } from 'zod';
import { userIdValidation } from '../../schemas/user.schemas';

export const getUserSchema = z.object({
	id: userIdValidation,
});
