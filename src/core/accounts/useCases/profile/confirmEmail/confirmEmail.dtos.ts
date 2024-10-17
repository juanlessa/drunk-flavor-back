import { z } from 'zod';
import { confirmEmailSchema } from './confirmEmail.schema';

export type ConfirmEmailReqBody = z.infer<typeof confirmEmailSchema>;

export type ConfirmEmail = {
	token: string;
};
