import { z } from 'zod/v4';
import { confirmEmailSchema } from './confirmEmail.schema';

export type ConfirmEmailReqBody = z.infer<typeof confirmEmailSchema>;

export type ConfirmEmail = {
	token: string;
};
