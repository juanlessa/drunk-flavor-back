import { z } from 'zod/v4';
import { createPasswordSchema } from './createPassword.schema';

export type CreatePasswordReqBody = z.infer<typeof createPasswordSchema>;

export type CreatePassword = {
	userId: string;
	password: string;
};
