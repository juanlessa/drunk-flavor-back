import { z } from 'zod/v4';
import { resendEmailVerificationSchema } from './resendEmailVerification.schema';

export type ResendEmailVerificationReqBody = z.infer<typeof resendEmailVerificationSchema>;

export type ResendEmailVerification = {
	email: string;
};
