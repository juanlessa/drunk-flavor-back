import { z } from 'zod/v4';
import { requestPasswordResetSchema } from './requestPasswordReset.schema';

export type RequestPasswordResetReqBody = z.infer<typeof requestPasswordResetSchema>;

export type RequestPasswordResetCommand = {
	email: string;
};
