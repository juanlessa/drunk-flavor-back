import { z } from 'zod';
import { tokenValidation } from '../../schemas/userToken.schemas';

export const confirmEmailSchema = z.object({
	token: tokenValidation,
});
