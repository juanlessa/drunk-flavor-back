import { z } from 'zod/v4';
import { googleAuthSchema } from './googleAuth.schema';

export type GoogleAuthReqBody = z.infer<typeof googleAuthSchema>;

export type GoogleAuth = {
	idToken: string;
};
